---
name: phase-manager
description: Manages development phases, generates changelogs, and handles git push operations securely.
---

# Phase Manager Skill

Use this skill when the user says "Phase complete", "Push this", or "Save progress".

## 🚀 Release Workflow

### Step 1: Quality Check
- Run `security-guard` skill logic (check for secrets).
- Ensure all new Python functions have **Japanese Docstrings** (Explanation of what the code does).
- *Action*: If Docstrings are missing, ask Claude Code (or generate them) to add them.

### Step 2: Changelog Update
- Analyze `git diff` or recent changes.
- Append to `CHANGELOG.md` under a new header:
  `## [YYYY-MM-DD] Phase: <Summary>`
  - List changed files.
  - List fixed bugs (if any).

### Step 3: Git Operation
1. `git add .`
2. `git commit -m "feat: <Summary of Phase> (Docs Updated)"`
3. `git push origin <current-branch>`

## ✅ Completion Message
- Output: "🎉 Phase Completed! Code pushed to GitHub, and CHANGELOG.md updated."
