"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TieredProposalGenerator = void 0;
const geminiClient_1 = require("../ai/geminiClient");
const patternMatcher_1 = require("./patternMatcher");
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
                costPerToken: 0.014,
                name: 'tier3'
            }
        };
        this.cache = cache;
        this.gemini = new geminiClient_1.GeminiClient();
        this.patternMatcher = new patternMatcher_1.PatternMatcher();
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
        municipality.tier = tier.name;
        // Check Cache (First Priority)
        const cached = await this.cache.getCachedProposal(municipality);
        if (cached) {
            console.log(`[Cache Hit] Returning cached proposal for ${municipality.id} (${tier.name})`);
            return cached;
        }
        // Tiered Generation Logic
        let proposalContent;
        try {
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
        }
        catch (error) {
            console.error('Generation failed, falling back to template', error);
            proposalContent = await this.generateTemplateProposal(municipality);
        }
        const proposal = {
            id: crypto.randomUUID(),
            municipalityId: municipality.id,
            title: `DX Proposal for ${municipality.name}`,
            content: proposalContent,
            tier: tier.name,
            generatedAt: new Date(),
            ttlHours: tier.name === 'tier1' ? 1 : (tier.name === 'tier2' ? 24 : 168)
        };
        // Save to Cache
        await this.cache.setCachedProposal(municipality, proposal);
        return proposal;
    }
    async generateFullProposal(m) {
        const prompt = `
        自治体名: ${m.name}
        人口: ${m.population}人
        予算規模: ${m.budget.toLocaleString()}円
        DXスコア: ${m.score}

        あなたは自治体DXの専門コンサルタントです。
        この自治体の詳細なDX推進提案書を作成してください。
        以下の構成で記述すること：
        1. 現状分析と課題
        2. 具体的な施策（3つ以上）
        3. 期待される効果（定量・定性）
        4. 推定予算とスケジュール
        `;
        const text = await this.gemini.generateText(prompt);
        return { type: 'full', text };
    }
    async generateSummaryProposal(m) {
        const prompt = `
        自治体名: ${m.name}
        DXスコア: ${m.score}

        この自治体向けのDX推進の要約提案を作成してください。
        重要な3つのポイントに絞り、簡潔に記述してください。
        `;
        const text = await this.gemini.generateText(prompt);
        return { type: 'summary', text };
    }
    async generateTemplateProposal(m) {
        // Pattern Matching for Tier 3
        const matched = await this.patternMatcher.findMatchingTemplate(m);
        if (matched && matched.content) {
            return { type: 'template', text: JSON.stringify(matched.content) };
        }
        // Fallback static template
        return {
            type: 'template',
            text: "General DX Improvement Template: Focus on digitalizing administrative procedures."
        };
    }
}
exports.TieredProposalGenerator = TieredProposalGenerator;
