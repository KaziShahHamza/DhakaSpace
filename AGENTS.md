# DhakaSpace Workspace Guidelines & Rules

Welcome to **DhakaSpace**, a rental platform designed for Dhaka City (Homes, Offices, and Shops) built with React, Node.js, Express, MongoDB, Google GenAI SDK (`@google/genai`), and Google ADK (`@google/adk`).

---

## 1. Monorepo Architecture

- `client/`: React + Vite + TypeScript + Tailwind CSS (Renter / Landlord experience).
- `server/`: Node.js + Express + TypeScript + Mongoose (API, GenAI SDK, ADK Concierge Agent).
- `mcp-server/`: Stdio MCP server exposing Dhaka real-estate data & market statistics tools.
- `.agents/`: Antigravity workspace customizations (Plugins, Skills, Rules, and Subagents).
- `scripts/`: Monorepo build, test, and SDLC automation scripts.
- `ROADMAP.md`: Official project phases, milestones, and development status.

---

## 2. Dhaka Real-Estate Domain Conventions

- **Currency**: All rental amounts and budgets are in Bangladeshi Taka (BDT, symbol `৳`). Avoid using USD or other foreign currencies.
- **Area Units**: Property sizes are measured in square feet (`sqft`).
- **Standard Dhaka Neighborhoods**:
  - `Gulshan`: High-end residential & diplomatic/corporate offices. Premium rent.
  - `Banani`: Trendy commercial, dining, boutique offices, and upscale residential.
  - `Dhanmondi`: Established residential hub, coaching centers, schools, and boutique retail.
  - `Mirpur`: Affordable and middle-class residential, commercial shopping complexes, manufacturing/IT startups.
  - `Uttara`: Planned residential sectors, corporate sub-offices, retail plazas near airport.
  - `Motijheel`: Historic central commercial district, banks, financial headquarters.
- **Categories**:
  - `home`: Apartments, flats, bachelor/family units.
  - `office`: Commercial workspaces, floorplates, IT suites.
  - `shop`: Retail storefronts, showroom spaces, market stalls.

---

## 3. Mandatory Agentic SDLC & Code Quality Gate

Before committing code or merging any feature branch into `main`:
1. **Branching**: Develop each feature on its own branch (`feat/<feature-name>`).
2. **Pre-commit Automated Check**: Run `./.agents/plugins/dhaka-sdlc-kit/skills/git-github-sdlc/scripts/sdlc-check.sh` to confirm no secrets (`.env`) are staged and syntax/build tests pass.
3. **Subagent Code Review**: Invoke the `code-reviewer` subagent on the staged `git diff`. Fix any reported critical security issues or regressions before committing.
4. **Conventional Commits**: Format commit messages as `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`, or `test: ...`.
5. **No Deprecated Gemini Models**: Always use current `@google/genai` models (`gemini-3.8-flash`, `gemini-4-carbon`, `gemini-4-argon`). Never use deprecated `gemini-1.5-*`, `gemini-2.0-*`, or `gemini-2.5-*` models.
