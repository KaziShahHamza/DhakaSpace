---
name: multi-mcp-orchestration
description: Architectural runbook and chaining patterns for orchestrating multiple MCP servers (dhaka-rental-mcp, mongodb-mcp, github-mcp, vercel-mcp) in compound agentic workflows.
---

# Multi-MCP Orchestration Runbook

Use this skill when a user request spans **multiple domains or systems** — for example, combining Dhaka real-estate domain logic (`dhaka-rental-mcp`), raw MongoDB inspection (`mongodb-mcp`), repository automation (`github-mcp`), or deployment checks (`vercel-mcp`).

## 1. Registered MCP Server Responsibilities

| Server Name | Scope & Purpose | Requires External Token? |
| :--- | :--- | :--- |
| **`dhaka-rental-mcp`** | Domain business logic: listing search, area rent summary, price anomaly audits, tenancy deed generation, DNCC/DSCC holding tax. | No (local MongoDB) |
| **`mongodb-mcp`** | Low-level DB ops: collection schemas, index verification, custom aggregations, stale record detection (`inquiries`, `listings`). | No (local MongoDB) |
| **`github-mcp`** | GitHub repository ops: opening issues, reading PRs, listing commits, posting automated audit reports. | Yes (`GITHUB_PERSONAL_ACCESS_TOKEN`) |
| **`vercel-mcp`** | Cloud deployment ops: checking build status, deployment logs, and environment variable parity. | Yes (`VERCEL_API_TOKEN`) |

## 2. Compound Orchestration Playbooks

### Playbook A: Data Hygiene & Price Anomaly -> GitHub Issue
1. **Audit Prices (`dhaka-rental-mcp`)**: Call `dhaka_audit_listing_prices` to detect overpriced or underpriced listings.
2. **Inspect Raw Records (`mongodb-mcp`)**: Query `listings` for missing descriptions, invalid contact formats, or stale `available: true` records, and inspect `inquiries` for unanswered `pending` visits.
3. **Report (`github-mcp`)**: If anomalies or data hygiene issues exist, file a structured GitHub Issue on `KaziShahHamza/DhakaSpace` summarizing the affected listing IDs and recommended actions.

### Playbook B: Landlord Legal & Tax Onboarding
1. **Benchmark Check (`dhaka-rental-mcp`)**: Call `dhaka_area_rent_summary` for the landlord's neighborhood to verify market competitiveness.
2. **Tax Estimation (`dhaka-rental-mcp`)**: Call `dhaka_calculate_holding_tax` for DNCC (Gulshan, Banani, Uttara, Mirpur) or DSCC (Dhanmondi, Motijheel).
3. **Deed Drafting (`dhaka-rental-mcp`)**: Call `dhaka_generate_tenancy_deed` to produce Bangladesh Premises Rent Control Act clauses.

### Playbook C: Pre-Release Platform Readiness
1. **Database Index Check (`mongodb-mcp`)**: Verify compound indexes exist on `listings` (`area`, `category`, `rentBdt`).
2. **Repo & CI Status (`github-mcp`)**: Check open PRs and recent workflow status.
3. **Deployment Check (`vercel-mcp`)**: Verify latest preview/production build status and required env vars (`MONGODB_URI`, `GEMINI_API_KEY`).

## 3. Graceful Degradation Rule
If an external MCP server (`github-mcp` or `vercel-mcp`) is unavailable because `GITHUB_PERSONAL_ACCESS_TOKEN` or `VERCEL_API_TOKEN` is not set:
- Do **not** abort the entire workflow.
- Complete all local steps (`dhaka-rental-mcp` and `mongodb-mcp`) first.
- Output the exact ready-to-copy Issue body or Deployment checklist in Markdown so the developer can apply it manually.
