-- Import Data SQL
-- This file will be executed by psql

-- Ensure tables exist (DDL)
DROP TABLE IF EXISTS municipalities;
CREATE TABLE IF NOT EXISTS municipalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL, -- Government Code
    name VARCHAR(255) NOT NULL,
    prefecture VARCHAR(100) NOT NULL,
    population INTEGER,
    budget BIGINT,
    score DECIMAL(5,2),
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copy commands
TRUNCATE TABLE municipalities;
\COPY municipalities(code, name, prefecture, population, budget, score, category) FROM '/data/cleaned/municipalities_cleaned.csv' WITH CSV HEADER;
