---
name: architecture-sync
description: Updates README.md and Mermaid diagrams to reflect the latest file structure and docker-compose configuration.
---

# Architecture Sync Skill

Use this skill when files are created/deleted or `docker-compose.yml` is modified.

## 📐 Visualization Standards
Keep `README.md` as the "Source of Truth".

### 1. Mermaid Diagram Update
Analyze `docker-compose.yml` and project structure. Update the Mermaid block in `README.md`:
- **Nodes**: Create nodes for every service (e.g., Next.js, Python API, TimescaleDB, Redis).
- **Edges**: Draw lines based on `depends_on` or network calls.
- **Style**: Use `subgraph` to group Backend (API+DB) and Frontend.

### 2. Documentation Rules
- **Transparency**: Every major folder (e.g., `./backend`, `./frontend`) must have a 1-line description in `README.md`.
- **Status**: Mark planned features as `(Planned)` and implemented ones as `(Active)`.

## 🔄 Execution Steps
1. Read current `docker-compose.yml`.
2. Generate new Mermaid code.
3. Overwrite the "Architecture" section in `README.md`.
4. Report: "📝 Documentation & Diagrams Updated".
