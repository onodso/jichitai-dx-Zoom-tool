import { createClient, RedisClientType } from 'redis';
import { Municipality, Proposal } from '../../types';
import { SemanticSearchService } from '../ai/semanticSearchService';

export class ProposalCache {
    private redis: RedisClientType;
    private readonly similarityThreshold = 0.75;
    private semanticSearch: SemanticSearchService;

    constructor() {
        this.redis = createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        this.redis.on('error', (err) => console.log('Redis Client Error', err));
        this.connect();
        this.semanticSearch = new SemanticSearchService();
    }

    private async connect() {
        if (!this.redis.isOpen) {
            await this.redis.connect();
        }
    }

    async get(key: string): Promise<Proposal | null> {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    async getCachedProposal(municipality: Municipality): Promise<Proposal | null> {
        // 1. Direct Cache
        const directCache = await this.get(`proposal:${municipality.id}`);
        if (directCache) return directCache;

        // 2. Semantic Similarity Cache (Smart Match)
        if (municipality.municipalityCode) {
            const similar = await this.findSimilarMunicipality(municipality);
            if (similar && similar.similarity > this.similarityThreshold) {
                console.log(`[Semantic Match] Using proposal from ${similar.proposal.municipalityId} (Score: ${similar.similarity.toFixed(3)})`);
                return this.adaptProposal(
                    similar.proposal,
                    municipality
                );
            }
        }

        return null;
    }

    async setCachedProposal(municipality: Municipality, proposal: Proposal): Promise<void> {
        const ttl = this.getTTLByTier(municipality.tier);
        // Redis key for direct access
        await this.redis.set(`proposal:${municipality.id}`, JSON.stringify(proposal), {
            EX: ttl
        });

        // Store by Code for Semantic Lookup Reverse Map (if needed, but we used CodeMap in memory)
        // For finding similar proposals, we need to know IF a municipality has a proposal.
        // We can maintain a set of "municipalities_with_proposals" in Redis or just scan.
        // For MVP, if SemanticSearch returns Code X, we check Redis `proposal:ID_of_X`.
        // Wait, Cache Key uses ID, but Semantic Search uses CODE. We need a mapping Code -> ID.
        if (municipality.municipalityCode) {
            await this.redis.set(`map:code:${municipality.municipalityCode}`, municipality.id);
        }
    }

    private getTTLByTier(tier?: string): number {
        switch (tier) {
            case 'tier1': return 3600; // 1 hour
            case 'tier2': return 86400; // 24 hours
            case 'tier3': return 604800; // 7 days
            default: return 3600;
        }
    }

    private async findSimilarMunicipality(target: Municipality): Promise<{ proposal: Proposal, similarity: number } | null> {
        if (!target.municipalityCode) return null;

        // Use Semantic Search to find similar codes
        const similarCandidates = this.semanticSearch.findSimilar(target.municipalityCode, 5);
        console.log(`[Semantic Search] Candidates for ${target.municipalityCode}:`, JSON.stringify(similarCandidates));

        for (const candidate of similarCandidates) {
            // Check if we have a proposal for this candidate
            // 1. Get ID from Code
            const candidateId = await this.redis.get(`map:code:${candidate.code}`);
            if (!candidateId) continue;

            // 2. Get Proposal
            const proposalData = await this.redis.get(`proposal:${candidateId}`);
            if (proposalData) {
                const proposal: Proposal = JSON.parse(proposalData);
                return { proposal, similarity: candidate.score };
            }
        }

        return null;
    }

    private adaptProposal(source: Proposal, target: Municipality): Proposal {
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
