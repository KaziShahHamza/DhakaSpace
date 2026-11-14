# DhakaSpace 🏢 🏡 🛍️

A modern rental platform for Dhaka City (Homes, Offices, and Shops) built with **React**, **Node.js/Express**, **MongoDB**, **Google GenAI SDK (`@google/genai`)**, and **Google ADK (`@google/adk`)**.

Designed as a learning and demonstration project for:
- **Agentic SDLC**: Custom workspace Rules (`AGENTS.md`), Skills, Plugins, and autonomous Subagents (`code-reviewer`).
- **Google GenAI SDK**: Structured Output autofill for landlords (`gemini-3.8-flash`).
- **Google Agent Development Kit (ADK)**: An intelligent Rental Concierge chat agent with tools to search Dhaka properties and estimate rent.
- **Model Context Protocol (MCP)**: Custom Stdio MCP server exposing Dhaka real-estate data & market analytics.

---

## Project Structure

```text
├── .agents/
│   ├── plugins.json                  # Workspace plugin discovery
│   └── plugins/
│       └── dhaka-sdlc-kit/          # Custom bundled plugin
│           ├── plugin.json
│           ├── rules/AGENTS.md      # Plugin rules
│           ├── skills/              # SDLC and Dhaka domain skills
│           └── agents/              # Subagent definitions
├── .github/
│   ├── workflows/ci.yml             # GitHub Actions CI
│   └── pull_request_template.md     # PR checklist
├── client/                          # React + Vite + Tailwind CSS frontend
├── server/                          # Express + MongoDB + GenAI/ADK backend
├── mcp-server/                      # Stdio MCP Server for Dhaka real estate
├── AGENTS.md                        # Root workspace rules
└── ROADMAP.md                       # Project phases & milestone tracker
```

---

## SDLC Commands

- `npm run sdlc:check`: Runs the automated pre-commit secret leak and config integrity scanner.
