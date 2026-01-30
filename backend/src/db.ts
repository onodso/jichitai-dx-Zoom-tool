import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || 'postgresql://user:pass@localhost:5432/localgov'
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
export const getClient = () => pool.connect();
