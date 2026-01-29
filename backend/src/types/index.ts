export interface Municipality {
    id: string;
    name: string;
    population: number;
    budget: number;
    score: number;
    category: string;
    municipalityCode?: string;
    // Tier info might be computed or stored
    tier?: 'tier1' | 'tier2' | 'tier3';
    [key: string]: any;
}

export interface Proposal {
    id: string;
    municipalityId: string;
    title: string;
    content: any; // Flexible JSON content
    tier: 'tier1' | 'tier2' | 'tier3';
    generatedAt: Date;
    ttlHours: number;
    cacheKey?: string;
}

export interface TierConfig {
    condition: (municipality: Municipality) => boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    maxPerPeriod: number;
    tokensPerProposal: number;
    costPerToken: number;
    name: 'tier1' | 'tier2' | 'tier3';
}
