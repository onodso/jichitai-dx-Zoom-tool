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

    async getStats() {
        try {
            // Total & Average
            const overviewSql = `
                SELECT 
                    COUNT(*) as total, 
                    AVG(NULLIF(score, 0)) as avg_score 
                FROM municipalities
            `;
            const overviewRes = await query(overviewSql);
            const total = parseInt(overviewRes.rows[0].total) || 0;
            const avgScore = parseFloat(overviewRes.rows[0].avg_score) || 0;

            // Distribution
            const distSql = `
                SELECT
                    CASE
                        WHEN score < 30 THEN '<30'
                        WHEN score < 50 THEN '30-49'
                        WHEN score < 70 THEN '50-69'
                        ELSE '70+'
                    END as range,
                    COUNT(*) as count
                FROM municipalities
                GROUP BY range
                ORDER BY count DESC
            `;
            const distRes = await query(distSql);

            // Format distribution for Recharts (ensure order if needed, but robust enough)
            const distribution = distRes.rows.map(row => ({
                name: row.range,
                value: parseInt(row.count)
            }));

            // Top Municipalities (assuming score exists)
            const topSql = `
                SELECT name, score 
                FROM municipalities 
                ORDER BY score DESC 
                LIMIT 5
            `;
            const topRes = await query(topSql);

            return {
                total,
                avgScore: Math.round(avgScore * 10) / 10,
                distribution,
                topRanking: topRes.rows.map(r => ({ name: r.name, score: parseFloat(r.score) || 0 }))
            };

        } catch (error) {
            console.error('Error fetching stats', error);
            return {
                total: 0,
                avgScore: 0,
                distribution: [],
                topRanking: []
            };
        }
    }
}
