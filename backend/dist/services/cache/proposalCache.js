"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalCache = void 0;
const redis_1 = require("redis");
class ProposalCache {
    constructor() {
        this.similarityThreshold = 0.85;
        this.redis = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.redis.on('error', (err) => console.log('Redis Client Error', err));
        this.connect();
    }
    async connect() {
        if (!this.redis.isOpen) {
            await this.redis.connect();
        }
    }
    async get(key) {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }
    async getCachedProposal(municipality) {
        // 1. Direct Cache
        const directCache = await this.get(`proposal:${municipality.id}`);
        if (directCache)
            return directCache;
        // 2. Similar Municipality Cache
        const similarMunicipality = await this.findSimilarMunicipality(municipality);
        if (similarMunicipality && similarMunicipality.similarity > this.similarityThreshold) {
            console.log(`[Cache Hit] Using similar proposal from ${similarMunicipality.proposal.municipalityId} for ${municipality.id}`);
            return this.adaptProposal(similarMunicipality.proposal, municipality);
        }
        // 3. Pattern Matching Cache
        // const patternKey = \`pattern:\${municipality.category}:\${municipality.scoreRange}\`;
        // const patternCache = await this.get(patternKey);
        // if (patternCache) {
        //   return this.applyPattern(JSON.parse(patternCache), municipality);
        // }
        return null;
    }
    async setCachedProposal(municipality, proposal) {
        const ttl = this.getTTLByTier(municipality.tier);
        // Redis key for direct access
        await this.redis.set(`proposal:${municipality.id}`, JSON.stringify(proposal), {
            EX: ttl
        });
        // Also set specific key used by generator if different
        if (municipality.tier) {
            await this.redis.set(`proposal:${municipality.id}:${municipality.tier}`, JSON.stringify(proposal), {
                EX: ttl
            });
        }
    }
    getTTLByTier(tier) {
        switch (tier) {
            case 'tier1': return 3600; // 1 hour
            case 'tier2': return 86400; // 24 hours
            case 'tier3': return 604800; // 7 days
            default: return 3600;
        }
    }
    // Simplified Similarity Search (Prototype)
    // In production, use Redis Stack (RediSearch) or pgvector
    async findSimilarMunicipality(target) {
        // 1. Scan for existing proposals (Inefficient for large sets, okay for prototype)
        const keys = await this.redis.keys('proposal:*:tier*'); // Filter by tier keys to ensure full metadata
        let bestMatch = null;
        for (const key of keys) {
            const data = await this.redis.get(key);
            if (!data)
                continue;
            const proposal = JSON.parse(data);
            // We need municipality features. For now, assuming proposal contains enough metadata or we fetch it.
            // Requirement update needed: Proposal/Cache should store features or ID to fetch features.
            // For prototype, we will skip if we don't have features.
            // Assuming we can fetch cached municipality data separately or it's in the key? No.
            // Allow simulating similarity if we can't fetch real features yet
            // Real implementation: Fetch candidate municipality from DB using proposal.municipalityId
            const candidateFeatures = await this.fetchFeatures(proposal.municipalityId);
            if (!candidateFeatures)
                continue;
            if (candidateFeatures.id === target.id)
                continue; // Skip self
            const similarity = this.calculateSimilarity(target, candidateFeatures);
            if (similarity > this.similarityThreshold) {
                if (!bestMatch || similarity > bestMatch.similarity) {
                    bestMatch = { proposal, similarity };
                }
            }
        }
        return bestMatch;
    }
    calculateSimilarity(m1, m2) {
        // Simple normalized Euclidean distance or Cosine Similarity on features
        // Features: population (log), budget (log), score
        const f1 = [Math.log10(m1.population || 1), Math.log10(m1.budget || 1), m1.score || 0];
        const f2 = [Math.log10(m2.population || 1), Math.log10(m2.budget || 1), m2.score || 0];
        // Normalize if needed, but for now simple 1 - distance
        // Max distance approx: pop (3-7), budget (6-11), score(0-100) -> dominate by score
        // Normalize score to 0-10 range roughly? Or normalize everything to 0-1.
        const norm = (val, min, max) => (val - min) / (max - min);
        // Approximate min/max for normalization
        const vec1 = [
            norm(f1[0], 3, 7), // Pop 1k - 10M
            norm(f1[1], 7, 12), // Budget 10M - 1T
            norm(f1[2], 0, 100) // Score
        ];
        const vec2 = [
            norm(f2[0], 3, 7),
            norm(f2[1], 7, 12),
            norm(f2[2], 0, 100)
        ];
        const dist = Math.sqrt(Math.pow(vec1[0] - vec2[0], 2) +
            Math.pow(vec1[1] - vec2[1], 2) +
            Math.pow(vec1[2] - vec2[2], 2));
        // Max possible dist for 3D unit cube is sqrt(3) ~ 1.73
        // Similarity = 1 - (dist / max_dist)
        return Math.max(0, 1 - (dist / 1.732));
    }
    // Mock fetch for prototype - in real app, inject Repository
    async fetchFeatures(id) {
        // This should ideally query Redis or DB.
        // For now returning null to avoid compilation error, logic needs DB access.
        return null;
    }
    adaptProposal(source, target) {
        // Clone and adapt
        return {
            ...source,
            id: crypto.randomUUID(),
            municipalityId: target.id,
            title: source.title.replace(/Proposal for .*/, `Proposal for ${target.name}`),
            generatedAt: new Date()
        };
    }
}
exports.ProposalCache = ProposalCache;
