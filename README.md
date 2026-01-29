# LocalGov DX Intelligence

Use AI to analyze municipality data and generate DX proposals.

## Architecture

```mermaid
graph TD
    subgraph Frontend
        NextJS[Next.js (App Router)]
    end

    subgraph Backend
        API[Node.js API (TypeScript)]
        DB[(PostgreSQL + TimescaleDB)]
        Redis[(Redis Cache)]
        Gemini[Gemini Pro API]
    end

    NextJS --> API
    API --> DB
    API --> Redis
    API --> Gemini
```

## Components
- **./frontend**: Next.js 14 application with Tailwind CSS (Active).
- **./backend**: Node.js/Express API with TypeScript (Active).
- **./data**: Data storage and migration scripts (Active).
- **./scripts**: Data migration and verification utilities (Active).
