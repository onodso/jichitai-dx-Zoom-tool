"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MunicipalityService = void 0;
const db_1 = require("../db");
class MunicipalityService {
    async getMunicipalityByCode(code) {
        const sql = `
            SELECT 
                id::text, 
                code, 
                name, 
                population, 
                budget, 
                category, 
                score -- assuming score is stored or calculated views
            FROM municipalities 
            WHERE code = $1
        `;
        try {
            const result = await (0, db_1.query)(sql, [code]);
            if (result.rows.length === 0)
                return null;
            const row = result.rows[0];
            return {
                id: row.id,
                municipalityCode: row.code,
                name: row.name,
                population: parseInt(row.population),
                budget: parseInt(row.budget),
                score: parseFloat(row.score) || 0, // Fallback if null
                category: row.category
            };
        }
        catch (error) {
            console.error('Error fetching municipality', error);
            throw new Error('Database error');
        }
    }
}
exports.MunicipalityService = MunicipalityService;
