import fs from 'fs';
import path from 'path';

interface EmbeddingMap {
    [code: string]: number; // Maps code to index in vector array
}

export class SemanticSearchService {
    private vectors: number[][] = [];
    private codeMap: EmbeddingMap = {};
    private indexMap: string[] = []; // Maps index to code
    private isLoaded = false;

    constructor() {
        this.loadData();
    }

    private loadData() {
        try {
            const dataDir = path.join(__dirname, '../../../data/cleaned');
            const vectorsPath = path.join(dataDir, 'municipality_vectors.json');
            const mapPath = path.join(dataDir, 'municipality_embedding_map.json');

            if (fs.existsSync(vectorsPath) && fs.existsSync(mapPath)) {
                console.log('Loading semantic vectors...');
                this.vectors = JSON.parse(fs.readFileSync(vectorsPath, 'utf-8'));
                this.codeMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));

                // Reverse map for lookup
                this.indexMap = new Array(this.vectors.length);
                Object.entries(this.codeMap).forEach(([code, idx]) => {
                    this.indexMap[idx] = code;
                });

                this.isLoaded = true;
                console.log(`Loaded ${this.vectors.length} semantic vectors.`);
            } else {
                console.warn('Semantic vectors not found. Skipping semantic search init.');
            }
        } catch (error) {
            console.error('Failed to load semantic vectors:', error);
        }
    }

    findSimilar(targetCode: string, topK: number = 3): { code: string; score: number }[] {
        if (!this.isLoaded) return [];

        const targetIdx = this.codeMap[targetCode];
        if (targetIdx === undefined) return [];

        const targetVector = this.vectors[targetIdx];
        const scores: { index: number; score: number }[] = [];

        // Brute-force Cosine Similarity (fast enough for N=1700)
        // Vectors are already normalized L2=1 in Python script, so dot product = cosine similarity
        for (let i = 0; i < this.vectors.length; i++) {
            if (i === targetIdx) continue;

            const score = this.dotProduct(targetVector, this.vectors[i]);
            scores.push({ index: i, score });
        }

        // Sort descending
        scores.sort((a, b) => b.score - a.score);

        return scores.slice(0, topK).map(s => ({
            code: this.indexMap[s.index],
            score: s.score
        }));
    }

    private dotProduct(v1: number[], v2: number[]): number {
        let sum = 0;
        for (let i = 0; i < v1.length; i++) {
            sum += v1[i] * v2[i];
        }
        return sum;
    }
}
