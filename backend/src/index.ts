import express from 'express';
import dotenv from 'dotenv';
import { ProposalCache } from './services/cache/proposalCache';
import { TieredProposalGenerator } from './services/proposal/tieredGenerator';
import { MunicipalityService } from './services/municipalityService';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// Services Initialization
const proposalCache = new ProposalCache();
const municipalityService = new MunicipalityService();
const proposalGenerator = new TieredProposalGenerator(proposalCache);

app.get('/', (req, res) => {
    res.send('LocalGov DX Intelligence API');
});

// Search Endpoint (Proxy to Python Search Service)
app.post('/api/search', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Call Python Search Service
        // Using 'search-api' as hostname from docker-compose
        const searchResponse = await fetch('http://search-api:8000/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, top_k: 5 }),
        });

        if (!searchResponse.ok) {
            throw new Error(`Search service error: ${searchResponse.statusText}`);
        }

        const data = await searchResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Search Proxy Error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Proposal Generation Endpoint
app.post('/api/proposals', async (req, res) => {
    try {
        const { municipalityCode } = req.body;

        if (!municipalityCode) {
            return res.status(400).json({ error: 'municipalityCode is required' });
        }

        // 1. Fetch Municipality Data
        const municipality = await municipalityService.getMunicipalityByCode(municipalityCode);

        if (!municipality) {
            return res.status(404).json({ error: 'Municipality not found' });
        }

        console.log(`Generating proposal for ${municipality.name} (Code: ${municipalityCode})`);

        // 2. Generate Proposal (Tier will be decided internally)
        const proposal = await proposalGenerator.generateProposal(municipality);

        res.json(proposal);

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
