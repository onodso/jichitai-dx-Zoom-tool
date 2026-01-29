import { Municipality, Proposal } from '../../types';

interface Template {
    id: string;
    name: string;
    category: 'efficiency' | 'digitalization' | 'infrastructure' | 'citizen_service';
    content: any;
    minScore?: number;
    maxScore?: number;
    keywords: string[];
}

export class PatternMatcher {
    private templates: Template[] = [
        {
            id: 'tpl_efficiency_001',
            name: 'Paperless Office Initiative',
            category: 'efficiency',
            content: { title: 'Reducing Paper Usage', body: 'Implement digital workflows...' },
            maxScore: 40,
            keywords: ['paper', 'workflow']
        },
        {
            id: 'tpl_citizen_001',
            name: 'Online Application Portal',
            category: 'citizen_service',
            content: { title: 'Citizen Portal Setup', body: 'Basic portal for resident services...' },
            minScore: 40,
            maxScore: 60,
            keywords: ['portal', 'online']
        }
    ];

    async findMatchingTemplate(municipality: Municipality): Promise<Proposal | null> {
        // Logic: Match municipality score range and needs (mocked via simple rules)

        const score = municipality.score;
        let matchedTemplate: Template | undefined;

        // Simple Rule-based matching
        if (score < 40) {
            matchedTemplate = this.templates.find(t => t.category === 'efficiency');
        } else {
            matchedTemplate = this.templates.find(t => t.category === 'citizen_service');
        }

        if (!matchedTemplate) return null;

        return {
            id: crypto.randomUUID(),
            municipalityId: municipality.id,
            title: `Template: ${matchedTemplate.name} for ${municipality.name}`,
            content: matchedTemplate.content,
            tier: 'tier3',
            generatedAt: new Date(),
            ttlHours: 168 // 1 week
        };
    }
}
