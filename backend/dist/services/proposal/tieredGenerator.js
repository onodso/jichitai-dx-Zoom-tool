"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TieredProposalGenerator = void 0;
class TieredProposalGenerator {
    constructor(cache) {
        this.tiers = {
            tier1: {
                condition: (municipality) => municipality.score > 80 && municipality.budget > 100000000,
                frequency: 'daily',
                maxPerPeriod: 50,
                tokensPerProposal: 2000,
                costPerToken: 0.014,
                name: 'tier1'
            },
            tier2: {
                condition: (municipality) => municipality.score >= 60 && municipality.score <= 80,
                frequency: 'weekly',
                maxPerPeriod: 200,
                tokensPerProposal: 800,
                costPerToken: 0.014,
                name: 'tier2'
            },
            tier3: {
                condition: (municipality) => municipality.score < 60,
                frequency: 'monthly',
                maxPerPeriod: 500,
                tokensPerProposal: 300,
                costPerToken: 0.014, // Assuming cache usage makes it effectively lower
                name: 'tier3'
            }
        };
        this.cache = cache;
    }
    determineTier(municipality) {
        if (this.tiers.tier1.condition(municipality))
            return this.tiers.tier1;
        if (this.tiers.tier2.condition(municipality))
            return this.tiers.tier2;
        return this.tiers.tier3;
    }
    async generateProposal(municipality) {
        const tier = this.determineTier(municipality);
        municipality.tier = tier.name; // Enrich municipality with tier
        // Check Cache (First Priority)
        const cached = await this.cache.get(`proposal:${municipality.id}:${tier.name}`);
        if (cached) {
            console.log(`[Cache Hit] Returning cached proposal for ${municipality.id} (${tier.name})`);
            return cached;
        }
        // Tiered Generation Logic
        let proposalContent;
        switch (tier.name) {
            case 'tier1':
                proposalContent = await this.generateFullProposal(municipality);
                break;
            case 'tier2':
                proposalContent = await this.generateSummaryProposal(municipality);
                break;
            case 'tier3':
                proposalContent = await this.generateTemplateProposal(municipality);
                break;
            default:
                proposalContent = await this.generateTemplateProposal(municipality);
        }
        const proposal = {
            id: crypto.randomUUID(),
            municipalityId: municipality.id,
            title: `DX Proposal for ${municipality.name}`,
            content: proposalContent,
            tier: tier.name,
            generatedAt: new Date(),
            ttlHours: tier.name === 'tier1' ? 1 : (tier.name === 'tier2' ? 24 : 168) // Simplified TTL Logic
        };
        // Save to Cache
        await this.cache.setCachedProposal(municipality, proposal);
        return proposal;
    }
    // Placeholder methods for actual generation
    async generateFullProposal(m) {
        return { type: 'full', text: `Comprehensive high-budget proposal for ${m.name}...` };
    }
    async generateSummaryProposal(m) {
        return { type: 'summary', text: `Summary strategy for ${m.name}...` };
    }
    async generateTemplateProposal(m) {
        return { type: 'template', text: `Standard efficiency template for ${m.name}...` };
    }
}
exports.TieredProposalGenerator = TieredProposalGenerator;
