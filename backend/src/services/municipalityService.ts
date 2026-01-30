import { query } from '../db';
import { Municipality } from '../types';

export class MunicipalityService {
    async getMunicipalityByCode(code: string): Promise<Municipality | null> {
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
            const result = await query(sql, [code]);
            if (result.rows.length === 0) return null;

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
        } catch (error) {
            console.error('Error fetching municipality', error);
            throw new Error('Database error');
        }
    }
}
