# DhakaSpace Project Roadmap & Execution Phases

This document is the single source of truth for the project lifecycle, architecture milestones, and current development status. Both developers and AI agents refer to this document across sessions.

---

## Progress Overview

| Phase | Milestone | Key Technologies | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Agentic SDLC & Workspace Tooling** | Git, GitHub Actions, Rules, Skills, Plugins, Subagents | ✅ **Completed** |
| **Phase 2** | **MERN Core Rental Platform** | Node.js, Express, MongoDB/Mongoose, React, Vite, Tailwind | ✅ **Completed** |
| **Phase 3** | **Custom Dhaka Rental MCP Server** | Model Context Protocol (`@modelcontextprotocol/sdk`), Stdio | ✅ **Completed** |
| **Phase 4** | **Google GenAI SDK & ADK Concierge** | `@google/genai` (Structured Outputs), `@google/adk` (Agent) | ✅ **Completed** |
| **Phase 5** | **Live In-Browser Verification** | Chrome DevTools MCP & Live API Verification | ✅ **Completed** |
| **Phase 6** | **Builtin & Multi-MCP Architecture** | MongoDB MCP (`mongodb-mcp-server`), GitHub MCP, Stdio MCP | ✅ **Completed** |
| **Phase 7** | **Multi-Plugin Architecture & Specialized Skills** | Multiple Plugins (`dhaka-legal-ops`), Legal & Copywriting Skills | ✅ **Completed** |
| **Phase 8** | **Autonomous Subagents Suite** | `legal-lease-agent`, `listing-copywriter`, `platform-auditor` | 📋 **Planned** |
| **Phase 9** | **Real-Life Application Features** | Legal Tenancy Deed Generator, AI Social Ad Booster, MCP Console | 📋 **Planned** |
| **Phase 10** | **End-to-End Verification & SDLC Gate** | SDLC Check, `code-reviewer` Subagent, Git Push | 📋 **Planned** |

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

### ✅ Phase 3: Custom Dhaka Rental MCP Server (`mcp-server/`)
- Created standalone Stdio MCP server under `mcp-server/` with `@modelcontextprotocol/sdk`.
- Implemented 3 custom tools with Zod input sanitization:
  1. `dhaka_search_listings`: Query MongoDB listings by category, area, and max rent.
  2. `dhaka_area_rent_summary`: Compute min/max/avg BDT rent and BDT/sqft by neighborhood.
  3. `dhaka_audit_listing_prices`: Audit listings against typical Dhaka market rates to detect anomalies.
- Plugin integration: Registered server in `.agents/plugins/dhaka-sdlc-kit/mcp_config.json`.
- Tested end-to-end via `mcp-server/src/test-client.ts` over Stdio transport.
- Code reviewed and approved by `code-reviewer` subagent.

### ✅ Phase 4: Google GenAI SDK & Google ADK Integration
- **`@google/genai` Smart Autofill**: `POST /api/ai/autofill` using `gemini-3.8-flash` with JSON Schema structured output to extract and normalize Dhaka shorthand notes into verified form fields.
- **`@google/adk` AI Concierge**: `POST /api/ai/chat` running an intelligent agent with function declarations (`Type.OBJECT`, `Type.STRING`, `Type.NUMBER`) and multi-turn session memory:
  - `search_dhaka_listings`: Queries MongoDB for properties.
  - `get_dhaka_area_stats`: Computes market averages.
  - `book_property_visit`: Books visits directly into MongoDB inquiries collection.
- Frontend integrated: Connected Landlord "✨ AI Autofill" button and Renter "Dhaka Rental Concierge" chat drawer with visual tool execution badges (`⚡ Tool: ...`).
- Code reviewed and approved by `code-reviewer` subagent.

### ✅ Phase 5: End-to-End Verification & Live Services
- Spun up backend daemon on `http://localhost:5000` (connected to MongoDB).
- Spun up frontend Vite daemon on `http://localhost:5173`.
- Verified live HTML document rendering, MongoDB listing queries, and area statistics.
- Validated `POST /api/ai/autofill` normalizing Dhaka shorthand into structured JSON.
- Validated `POST /api/ai/chat` autonomous tool execution (`get_dhaka_area_stats`, `search_dhaka_listings`) with tool badge notifications.
- All 5 phases fully realized, reviewed by `code-reviewer` subagent, and pushed to GitHub.
- Spin up app and launch Chrome DevTools MCP.
- Audit console messages, network calls, filter interactions, and AI chat flow in real browser session.

---

### ✅ Phase 6: Builtin MCP Integrations & Multi-MCP Architecture
- **Multi-MCP Configuration**: Expand `.agents/plugins/dhaka-sdlc-kit/mcp_config.json` with builtin/standard MCP servers:
  - `mongodb-mcp`: `mongodb-mcp-server` allowing direct collection querying, index auditing, and database aggregation pipelines.
  - `github-mcp`: `@modelcontextprotocol/server-github` allowing issue creation, PR management, and repo metadata extraction.
- **Custom MCP Server Expansion (`mcp-server/`)**:
  - Add `dhaka_generate_tenancy_deed`: Generates Bangladesh Premises Rent Control Act clauses based on property category, rent, and advance deposit.
  - Add `dhaka_calculate_holding_tax`: Estimates Dhaka City Corporation (DNCC / DSCC) annual holding tax based on property valuation.
- **Automated Multi-MCP Stdio Verification**: Verify tool listings and test invocations.

### ✅ Phase 7: Multi-Plugin Architecture & Specialized Skills
- **Second Plugin (`dhaka-legal-ops`)**:
  - Register in `.agents/plugins.json` and declare `.agents/plugins/dhaka-legal-ops/plugin.json`.
  - Demonstrate plugin boundaries, encapsulation, and cross-plugin skill/tool discovery.
- **Specialized Skills**:
  - `dhaka-legal-agreements` (`.agents/plugins/dhaka-legal-ops/skills/dhaka-legal-agreements/SKILL.md`): Bangladesh Premises Rent Control Act 1991, 300 BDT non-judicial stamp requirement, advance deposit limits, 2-month notice, commercial VAT/holding tax.
  - `dhaka-seo-copywriting` (`.agents/plugins/dhaka-legal-ops/skills/dhaka-seo-copywriting/SKILL.md`): High-converting bilingual (English & Bangla) copy frameworks for Facebook rental groups, Bikroy, and WhatsApp broadcasts.
  - `multi-mcp-orchestration` (`.agents/plugins/dhaka-sdlc-kit/skills/multi-mcp-orchestration/SKILL.md`): Runbook for chaining MongoDB MCP, custom Dhaka MCP, and GitHub MCP in complex compound agent tasks.

### 📋 Phase 8: Autonomous Subagents Suite
- **`legal-lease-agent`**: Real estate attorney persona generating compliant tenancy deeds with customizable advance deposit, notice period, and maintenance clauses.
- **`listing-copywriter`**: Real estate marketer persona producing multi-channel bilingual ad copy (Facebook, Bikroy, WhatsApp) with Dhaka neighborhood selling points.
- **`platform-auditor`**: DevOps & DB reliability engineer persona using MongoDB MCP and GitHub MCP to check query performance, index coverage, and issue logs.
- Register subagents with `define_subagent` and persist in plugin agent folders.

### 📋 Phase 9: Real-Life Application Features
- **Backend Endpoints (`server/src/routes/ai.ts` & `server/src/routes/mcp.ts`)**:
  - `POST /api/ai/generate-lease`: Generates printable Bangladesh-compliant Tenancy Deed.
  - `POST /api/ai/generate-ad-copy`: Generates 3 social ad variants (Facebook, Bikroy, Bangla).
  - `GET /api/mcp/status`: Surfaces registered MCP servers and tools to the frontend.
- **Frontend UI Features (`client/src/components/`)**:
  - `LeaseGeneratorModal.tsx`: Generate, preview, copy, and print tenancy agreements.
  - `AdCopyModal.tsx`: 1-click marketing copy generator for active listings.
  - `McpConsoleDrawer.tsx`: Dev/Admin drawer showing live MCP servers and tool explorer.

### 📋 Phase 10: End-to-End Verification & SDLC Gate
- Run `sdlc-check.sh` and compile checks (`server/` and `client/`).
- Verify in browser with Chrome DevTools MCP.
- Run `code-reviewer` subagent on the staged `git diff`.
- Merge branch and push to GitHub with Conventional Commits.
