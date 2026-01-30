"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const proposalCache_1 = require("./services/cache/proposalCache");
const tieredGenerator_1 = require("./services/proposal/tieredGenerator");
const municipalityService_1 = require("./services/municipalityService");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use(express_1.default.json());
// Services Initialization
const proposalCache = new proposalCache_1.ProposalCache();
const municipalityService = new municipalityService_1.MunicipalityService();
const proposalGenerator = new tieredGenerator_1.TieredProposalGenerator(proposalCache);
app.get('/', (req, res) => {
    res.send('LocalGov DX Intelligence API');
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
    }
    catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
