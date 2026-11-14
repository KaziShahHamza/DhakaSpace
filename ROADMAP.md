# DhakaSpace Project Roadmap & Execution Phases

This document is the single source of truth for the project lifecycle, architecture milestones, and current development status. Both developers and AI agents refer to this document across sessions.

---

## Progress Overview

| Phase | Milestone | Key Technologies | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Agentic SDLC & Workspace Tooling** | Git, GitHub Actions, Rules, Skills, Plugins, Subagents | ✅ **Completed** |
| **Phase 2** | **MERN Core Rental Platform** | Node.js, Express, MongoDB/Mongoose, React, Vite, Tailwind | ✅ **Completed** |
| **Phase 3** | **Custom Dhaka Rental MCP Server** | Model Context Protocol (`@modelcontextprotocol/sdk`), Stdio | ⏳ **In Progress (Next)** |
| **Phase 4** | **Google GenAI SDK & ADK Concierge** | `@google/genai` (Structured Outputs), `@google/adk` (Agent) | 🔮 Upcoming |
| **Phase 5** | **Live In-Browser Verification** | Chrome DevTools MCP (`chrome-devtools`) | 🔮 Upcoming |

---

## Detailed Phase Breakdown

### ✅ Phase 1: Agentic SDLC Foundation (Merged into `main`)
- **Git & GitHub Remote**: Connected to `https://github.com/KaziShahHamza/DhakaSpace.git`.
- **Workspace Rules (`AGENTS.md`)**: Set monorepo architecture and Dhaka domain constraints (BDT `৳`, `sqft`, neighborhoods, categories).
- **Custom Plugin (`.agents/plugins/dhaka-sdlc-kit/`)**: Bundled SDLC tools into a reusable package declared via `.agents/plugins.json`.
- **Pre-Commit Hook & Secret Scanning**: Executable script `sdlc-check.sh` preventing `.env` and sensitive leaks.
- **Autonomous Code Review Subagent (`code-reviewer`)**: Configured and tested autonomous review loop on git diffs before merging.
- **CI Workflow (`.github/workflows/ci.yml`)**: Automated builds and integrity checks on GitHub.

### ✅ Phase 2: MERN Core Rental Platform (Merged into `main`)
- **Backend API (`server/`)**:
  - `Listing` & `Inquiry` Mongoose models with compound index filtering.
  - REST endpoints: `GET /api/listings` (filter by category, area, max rent, search query), `GET /api/listings/stats` (Dhaka area market averages), `POST /api/listings`, `POST /api/inquiries`.
  - Realistic seed database with 9 Dhaka properties across Home, Office, and Shop categories.
- **Frontend App (`client/`)**:
  - React + TypeScript + Tailwind CSS user interface.
  - Renter Mode vs. Landlord Mode toggle in header.
  - Filter bar: category pills, Dhaka neighborhood selector (Gulshan, Banani, Dhanmondi, Mirpur, Uttara, Motijheel), and BDT budget slider.
  - Property detail modal and visit scheduling inquiry modal.
  - Landlord listing creation modal with "✨ AI Autofill" entry point.
  - Slide-out AI Concierge drawer.

### ⏳ Phase 3: Custom Dhaka Rental MCP Server (`mcp-server/`)
- Create standalone Stdio MCP server under `mcp-server/`.
- Expose 3 custom tools for AI models:
  1. `dhaka_search_listings`: Query MongoDB listings by category, area, and max rent.
  2. `dhaka_area_rent_summary`: Compute min/max/avg BDT rent and BDT/sqft by neighborhood.
  3. `dhaka_audit_listing_prices`: Audit listings against typical Dhaka market rates to detect anomalies.
- Register server into `.agents/plugins/dhaka-sdlc-kit/mcp_config.json`.
- Run SDLC check + `code-reviewer` subagent audit and commit.

### 🔮 Phase 4: Google GenAI SDK & Google ADK Integration
- **`@google/genai` Smart Autofill**: `POST /api/ai/autofill` using `gemini-3.8-flash` with JSON Schema structured output to turn landlord notes into listing fields.
- **`@google/adk` AI Concierge**: `POST /api/ai/chat` running an ADK Agent with tool-calling capabilities against Dhaka listings and area stats.
- Wire frontend Concierge Drawer and Post Listing form to backend AI endpoints.
- Run SDLC check + `code-reviewer` subagent audit and commit.

### 🔮 Phase 5: End-to-End Verification with Chrome DevTools MCP
- Spin up app and launch Chrome DevTools MCP.
- Audit console messages, network calls, filter interactions, and AI chat flow in real browser session.
