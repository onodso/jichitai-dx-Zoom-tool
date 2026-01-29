---
name: security-guard
description: Validates code for security risks (hardcoded secrets) and enforces .env usage before saving or committing.
---

# Security Guard Skill

You must use this skill WHENEVER the user asks to "save", "commit", or "deploy", OR when new code contains potential secrets.

## 🛡 Security Checklist
Before approving any file changes:

1.  **Secret Scanning**:
    - Scan `docker-compose.yml`, `*.py`, `*.js`, `*.json` for hardcoded passwords, API keys, or tokens.
    - *Action*: If found, STOP. Move the secret to `.env` and replace it with `os.getenv('KEY')` or `${KEY}`.

2.  **Git Protection**:
    - Check `.gitignore` before any git operation.
    - Ensure it includes: `.env`, `__pycache__`, `*.log`, `.DS_Store`.
    - *Action*: If missing, append them immediately using the terminal.

3.  **Config Validation**:
    - For `docker-compose.yml`: Ensure no plain text passwords (like `POSTGRES_PASSWORD=pass`) exist. Use `${VAR}` syntax.

## 🚨 Failure Protocol
If a violation is found:
- Do NOT proceed with the user's request.
- Fix the issue automatically (create .env, refactor code).
- Report: "🛡️ Security Violation Fixed: Moved [Secret Name] to .env".
