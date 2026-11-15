import { Router, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

export const mcpRouter = Router();

interface McpToolInfo {
  name: string;
  description: string;
  parameters: string[];
}

interface McpServerStatus {
  name: string;
  plugin: string;
  transport: "stdio" | "http";
  commandSummary: string;
  status: "configured" | "env-placeholder";
  tools: McpToolInfo[];
}

const DHAKA_RENTAL_TOOLS: McpToolInfo[] = [
  {
    name: "dhaka_search_listings",
    description: "Search active Dhaka rental listings by category, area, and max BDT rent.",
    parameters: ["category?", "area?", "maxRent?"],
  },
  {
    name: "dhaka_area_rent_summary",
    description: "Compute min, max, avg BDT rent and BDT/sqft benchmarks by neighborhood.",
    parameters: ["area?", "category?"],
  },
  {
    name: "dhaka_audit_listing_prices",
    description: "Audit listings against Dhaka market benchmarks to flag price anomalies.",
    parameters: ["area?"],
  },
  {
    name: "dhaka_generate_tenancy_deed",
    description: "Generate Bangladesh Premises Rent Control Act (1991) tenancy deed clauses.",
    parameters: ["area", "category", "sizeSqft", "rentBdt", "advanceMonths?"],
  },
  {
    name: "dhaka_calculate_holding_tax",
    description: "Estimate annual DNCC/DSCC municipal holding tax for a Dhaka property.",
    parameters: ["area", "category", "rentBdt", "sizeSqft?"],
  },
];

const BUILTIN_SERVER_TOOLS: Record<string, McpToolInfo[]> = {
  "dhaka-rental-mcp": DHAKA_RENTAL_TOOLS,
  "mongodb-mcp": [
    {
      name: "find / aggregate",
      description: "Query and run aggregation pipelines on local DhakaSpace MongoDB collections.",
      parameters: ["database", "collection", "filter/pipeline"],
    },
    {
      name: "collection-indexes",
      description: "Inspect index coverage on listings and inquiries collections.",
      parameters: ["database", "collection"],
    },
  ],
  "github-mcp": [
    {
      name: "create_pull_request / merge_pull_request",
      description: "Open and merge PRs against main following DhakaSpace SDLC rules.",
      parameters: ["owner", "repo", "pull_number/head/base"],
    },
    {
      name: "list_issues / create_issue",
      description: "Track and file repository audit issues.",
      parameters: ["owner", "repo", "title"],
    },
  ],
  "vercel-mcp": [
    {
      name: "list_deployments / get_deployment",
      description: "Inspect Vercel preview/production builds and runtime logs.",
      parameters: ["projectId"],
    },
  ],
};

function resolveRepoRoot(): string {
  // Works whether running from repo root or server/
  const candidates = [
    path.resolve(process.cwd(), ".agents/plugins/dhaka-sdlc-kit/mcp_config.json"),
    path.resolve(process.cwd(), "../.agents/plugins/dhaka-sdlc-kit/mcp_config.json"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return path.dirname(path.dirname(path.dirname(path.dirname(candidate))));
    }
  }
  return path.resolve(process.cwd(), "..");
}

// GET /api/mcp/status - Surface registered MCP servers and tools (no secret values exposed)
mcpRouter.get(
  "/status",
  (_req: Request, res: Response, next: NextFunction) => {
    try {
      const repoRoot = resolveRepoRoot();
      const mcpConfigPath = path.join(
        repoRoot,
        ".agents/plugins/dhaka-sdlc-kit/mcp_config.json"
      );

      const servers: McpServerStatus[] = [];

      if (fs.existsSync(mcpConfigPath)) {
        const raw = fs.readFileSync(mcpConfigPath, "utf-8");
        const parsed = JSON.parse(raw) as {
          mcpServers?: Record<
            string,
            {
              command?: string;
              args?: string[];
              url?: string;
              env?: Record<string, string>;
            }
          >;
        };

        for (const [name, cfg] of Object.entries(parsed.mcpServers || {})) {
          const envValues = Object.values(cfg.env || {});
          const hasPlaceholder = envValues.some((v) => v.includes("${"));
          const commandSummary = cfg.url
            ? cfg.url
            : `${cfg.command || "npx"} ${(cfg.args || []).slice(0, 2).join(" ")}`.trim();

          servers.push({
            name,
            plugin: "dhaka-sdlc-kit",
            transport: cfg.url ? "http" : "stdio",
            commandSummary,
            status: hasPlaceholder ? "env-placeholder" : "configured",
            tools: BUILTIN_SERVER_TOOLS[name] || [],
          });
        }
      }

      res.json({
        success: true,
        data: {
          serverCount: servers.length,
          totalTools: servers.reduce((acc, s) => acc + s.tools.length, 0),
          servers,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
