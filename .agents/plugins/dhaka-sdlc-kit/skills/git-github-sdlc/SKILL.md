---
name: git-github-sdlc
description: >-
  Use this skill to guide the end-to-end Git and GitHub Software Development Lifecycle (SDLC) for DhakaSpace:
  branching, automated pre-commit quality checks, secret leakage detection, invoking the code-reviewer subagent,
  and formatting conventional commits and PR descriptions.
---

# Git & GitHub SDLC Runbook

This skill outlines the strict 5-step SDLC process that must be followed for every feature, bugfix, or enhancement in the DhakaSpace repository.

## SDLC 5-Step Process

```mermaid
flowchart TD
    A["1. Branch (feat/* or fix/*)"] --> B["2. Implement & Self-Test"]
    B --> C["3. Run Automated SDLC Check (sdlc-check.sh)"]
    C --> D["4. Invoke code-reviewer Subagent"]
    D --> E{"Review Approved?"}
    E -- No --> B
    E -- Yes --> F["5. Conventional Commit & Push/Merge"]
```

### Step 1: Feature Branching
Always create a descriptive branch from up-to-date `main`:
```bash
git checkout main
git checkout -b feat/<feature-name>
```

### Step 2: Implementation & Self-Test
Write code following project rules in `AGENTS.md`. Verify TypeScript builds and tests run cleanly.

### Step 3: Run Automated SDLC Check
Run the bundled verification script:
```bash
./.agents/plugins/dhaka-sdlc-kit/skills/git-github-sdlc/scripts/sdlc-check.sh
```
This script validates:
- No sensitive files (`.env`, `*.pem`, `*.key`) are staged or tracked.
- Git repository status is healthy and on a valid branch.
- Monorepo package files have valid JSON syntax.

### Step 4: Invoke the Code-Reviewer Subagent
Before committing, invoke the `code-reviewer` subagent:
- Prompt the subagent with the output of `git status -s` and `git diff`.
- Check its findings for security vulnerabilities, MERN bugs, or deprecated Gemini models.
- If changes are requested, fix them and re-run the check.

### Step 5: Conventional Commit, Push & GitHub MCP Pull Request
Once approved by `code-reviewer`:
```bash
git add <files>
git commit -m "feat(scope): concise description"
git push -u origin <branch-name>
```
**Do NOT merge locally into `main`.** Instead, use the **GitHub MCP** server:
1. Call `create_pull_request` (`base: "main"`, `head: "<branch-name>"`) filling out `.github/pull_request_template.md`.
2. Call `merge_pull_request` on the newly created PR number to merge into `main` on GitHub.
3. Sync local `main` before starting the next phase:
```bash
git checkout main
git pull origin main
```
