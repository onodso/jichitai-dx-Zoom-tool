# Changelog

All notable changes to this project will be documented in this file.

## [2026-01-30] Phase: Initial Setup, Data Migration & Cache Strategy
- **Infrastructure**: Established Docker Compose environment (Next.js, Node.js, TimescaleDB, Redis).
- **Data Migration**: 
  - Implemented transformation scripts (`transform_data.py`) to merge Master and DX Progress data.
  - Successfully migrated 1,916 municipality records to PostgreSQL.
- **Cache Strategy**:
  - Implemented `ProposalCache` with similarity calculation logic (Tier 1/2).
  - Implemented `PatternMatcher` for Tier 3 template selection.
- **Security**: Added `.env` and `.gitignore` via Security Guard skill.
- **Phase 3**: 
  - Integrated `@google/generative-ai` SDK.
  - Implemented `GeminiClient` with API wrapper.
  - Implemented `TieredProposalGenerator` with:
    - Tier 1 (Full Proposal) using Gemini Pro.
    - Tier 2 (Summary) using Gemini Pro.
    - Tier 3 (Template) using Pattern Matching fallback.
  - Verified graceful degradation when API key is missing.
- **Infrastructure**:
  - Optimized Redis configuration (Memory Limit: 256MB, MaxMemory: 200MB) to prevent OOM.
  - Updated System Architecture in README.md.
- **Phase 4**:
  - Implemented Semantic Search Service (Python/FastAPI) using `pkshatech/GLuCoSE-base-ja`.
  - Added Backend proxy endpoint `/api/search` for vector search.
  - Integrated Search UI in Frontend Header with auto-complete.
  - Updated Docker infrastructure with `search-api` service and Japanese tokenizer dependencies.
- **Phase 5**:
  - Enhanced Dashboard visualization with `recharts`.
  - Added Backend statistics endpoint `/api/dashboard/stats`.
  - Implemented `DXScoreChart` and `RankingChart` for real-time data visualization.
