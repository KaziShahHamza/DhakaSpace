import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { z } from "zod";
import { Listing, DhakaArea, ListingCategory } from "./models/Listing";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dhakaspace";

// Zod Validation Schemas to sanitize incoming tool arguments
const SearchListingsSchema = z.object({
  category: z.enum(["home", "office", "shop"]).optional(),
  area: z
    .enum(["Gulshan", "Banani", "Dhanmondi", "Mirpur", "Uttara", "Motijheel"])
    .optional(),
  maxRentBdt: z.number().positive().optional(),
  minSqft: z.number().positive().optional(),
});

const AreaSummarySchema = z.object({
  area: z
    .enum(["Gulshan", "Banani", "Dhanmondi", "Mirpur", "Uttara", "Motijheel"])
    .optional(),
});

// Benchmark ranges (BDT / sqft) defined in dhaka-rental-domain skill
const NEIGHBORHOOD_BENCHMARKS: Record<
  DhakaArea,
  Record<ListingCategory, { min: number; max: number }>
> = {
  Gulshan: {
    home: { min: 45, max: 90 },
    office: { min: 90, max: 180 },
    shop: { min: 150, max: 350 },
  },
  Banani: {
    home: { min: 40, max: 75 },
    office: { min: 80, max: 150 },
    shop: { min: 130, max: 300 },
  },
  Dhanmondi: {
    home: { min: 30, max: 55 },
    office: { min: 55, max: 100 },
    shop: { min: 90, max: 220 },
  },
  Uttara: {
    home: { min: 25, max: 45 },
    office: { min: 50, max: 90 },
    shop: { min: 80, max: 180 },
  },
  Mirpur: {
    home: { min: 18, max: 32 },
    office: { min: 35, max: 65 },
    shop: { min: 50, max: 120 },
  },
  Motijheel: {
    home: { min: 20, max: 35 },
    office: { min: 60, max: 120 },
    shop: { min: 80, max: 200 },
  },
};

// Define MCP Tool Metadata
const TOOLS: Tool[] = [
  {
    name: "dhaka_search_listings",
    description:
      "Search verified rental listings in Dhaka City with category, area, and BDT budget filters.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["home", "office", "shop"],
          description: "Property type: home, office, or shop",
        },
        area: {
          type: "string",
          enum: [
            "Gulshan",
            "Banani",
            "Dhanmondi",
            "Mirpur",
            "Uttara",
            "Motijheel",
          ],
          description: "Dhaka neighborhood to search within",
        },
        maxRentBdt: {
          type: "number",
          description: "Maximum monthly rent budget in Bangladeshi Taka (৳)",
        },
        minSqft: {
          type: "number",
          description: "Minimum space in square feet (sqft)",
        },
      },
    },
  },
  {
    name: "dhaka_area_rent_summary",
    description:
      "Get aggregated rental statistics (avg rent, min/max rent, avg BDT/sqft) across Dhaka neighborhoods.",
    inputSchema: {
      type: "object",
      properties: {
        area: {
          type: "string",
          enum: [
            "Gulshan",
            "Banani",
            "Dhanmondi",
            "Mirpur",
            "Uttara",
            "Motijheel",
          ],
          description:
            "Specific Dhaka neighborhood to summarize, or omit to view all areas",
        },
      },
    },
  },
  {
    name: "dhaka_audit_listing_prices",
    description:
      "Audit Dhaka rental listings against established BDT/sqft neighborhood benchmarks to flag underpriced or overpriced properties.",
    inputSchema: {
      type: "object",
      properties: {
        area: {
          type: "string",
          enum: [
            "Gulshan",
            "Banani",
            "Dhanmondi",
            "Mirpur",
            "Uttara",
            "Motijheel",
          ],
          description: "Area to audit or leave empty for citywide audit",
        },
      },
    },
  },
];

// Initialize MCP Server
const server = new Server(
  {
    name: "dhaka-rental-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List Tools Request Handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Call Tool Request Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case "dhaka_search_listings": {
        const validated = SearchListingsSchema.parse(args);
        const filter: Record<string, unknown> = { available: true };
        if (validated.category) filter.category = validated.category;
        if (validated.area) filter.area = validated.area;
        if (typeof validated.maxRentBdt === "number")
          filter.rentBdt = { $lte: validated.maxRentBdt };
        if (typeof validated.minSqft === "number")
          filter.sizeSqft = { $gte: validated.minSqft };

        const listings = await Listing.find(filter)
          .sort({ rentBdt: 1 })
          .limit(10);

        if (listings.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No matching properties found in Dhaka matching your criteria. Try widening your budget or selecting a different neighborhood.",
              },
            ],
          };
        }

        const formatted = listings.map((l, index) => {
          const bdtPerSqft = Math.round(l.rentBdt / l.sizeSqft);
          return [
            `### ${index + 1}. ${l.title}`,
            `- **Type**: ${l.category.toUpperCase()} | **Area**: ${l.area}, Dhaka`,
            `- **Address**: ${l.address}`,
            `- **Rent**: ৳ ${l.rentBdt.toLocaleString()} / month (~৳ ${bdtPerSqft}/sqft)`,
            `- **Size**: ${l.sizeSqft} sqft | **Floor**: ${l.floor}${
              l.bedrooms ? ` | **Beds**: ${l.bedrooms}` : ""
            }`,
            `- **Advance Deposit**: ${l.advanceMonths} months`,
            `- **Key Amenities**: ${
              l.amenities.slice(0, 4).join(", ") || "Standard"
            }`,
            `- **Contact**: ${l.contactName} (${l.contactPhone})`,
          ].join("\n");
        });

        return {
          content: [
            {
              type: "text",
              text: `Found ${listings.length} verified Dhaka rental listing(s):\n\n${formatted.join(
                "\n\n---\n\n"
              )}`,
            },
          ],
        };
      }

      case "dhaka_area_rent_summary": {
        const validated = AreaSummarySchema.parse(args);
        const matchStage: Record<string, unknown> = { available: true };
        if (validated.area) matchStage.area = validated.area;

        const stats = await Listing.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: { area: "$area", category: "$category" },
              count: { $sum: 1 },
              avgRent: { $avg: "$rentBdt" },
              minRent: { $min: "$rentBdt" },
              maxRent: { $max: "$rentBdt" },
              avgSqft: { $avg: "$sizeSqft" },
            },
          },
          {
            $project: {
              _id: 0,
              area: "$_id.area",
              category: "$_id.category",
              count: 1,
              avgRent: { $round: ["$avgRent", 0] },
              minRent: 1,
              maxRent: 1,
              avgSqft: { $round: ["$avgSqft", 0] },
              avgBdtPerSqft: {
                $cond: [
                  { $gt: ["$avgSqft", 0] },
                  { $round: [{ $divide: ["$avgRent", "$avgSqft"] }, 1] },
                  0,
                ],
              },
            },
          },
          { $sort: { area: 1, category: 1 } },
        ]);

        if (stats.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No rental data found for ${args.area || "Dhaka City"}.`,
              },
            ],
          };
        }

        const rows = stats.map(
          (s) =>
            `| **${s.area}** | ${s.category.toUpperCase()} | ${s.count} | ৳ ${s.avgRent.toLocaleString()} | ৳ ${s.minRent.toLocaleString()} - ৳ ${s.maxRent.toLocaleString()} | ৳ ${s.avgBdtPerSqft} |`
        );

        const table = [
          `| Neighborhood | Category | Listings | Avg Rent (BDT) | Range (BDT) | Avg BDT/sqft |`,
          `|---|---|---|---|---|---|`,
          ...rows,
        ].join("\n");

        return {
          content: [
            {
              type: "text",
              text: `### Dhaka Real-Estate Rental Market Summary\n\n${table}\n\n*Note: Rental figures represent monthly active rates in BDT (৳).*`,
            },
          ],
        };
      }

      case "dhaka_audit_listing_prices": {
        const validated = AreaSummarySchema.parse(args);
        const filter: Record<string, unknown> = { available: true };
        if (validated.area) filter.area = validated.area;

        const listings = await Listing.find(filter);

        const auditResults = listings.map((l) => {
          const actualRate = Math.round(l.rentBdt / l.sizeSqft);
          const benchmark =
            NEIGHBORHOOD_BENCHMARKS[l.area]?.[l.category] || {
              min: 20,
              max: 100,
            };

          let verdict: "NORMAL" | "OVERPRICED" | "UNDERPRICED" = "NORMAL";
          let deviationPercent = 0;

          if (actualRate > benchmark.max) {
            verdict = "OVERPRICED";
            deviationPercent = Math.round(
              ((actualRate - benchmark.max) / benchmark.max) * 100
            );
          } else if (actualRate < benchmark.min) {
            verdict = "UNDERPRICED";
            deviationPercent = Math.round(
              ((benchmark.min - actualRate) / benchmark.min) * 100
            );
          }

          return {
            title: l.title,
            area: l.area,
            category: l.category,
            rentBdt: l.rentBdt,
            sizeSqft: l.sizeSqft,
            actualRate,
            expectedRange: `৳${benchmark.min} - ৳${benchmark.max}`,
            verdict,
            deviationPercent,
          };
        });

        const anomalies = auditResults.filter((r) => r.verdict !== "NORMAL");
        const normalCount = auditResults.length - anomalies.length;

        let report = `### DhakaSpace Listing Price Audit Report\n\n`;
        report += `- **Total Listings Audited**: ${auditResults.length}\n`;
        report += `- **Within Normal Dhaka Benchmark**: ${normalCount}\n`;
        report += `- **Pricing Deviations / Anomalies**: ${anomalies.length}\n\n`;

        if (anomalies.length > 0) {
          report += `#### Flagged Anomalies:\n`;
          anomalies.forEach((a, i) => {
            const badge =
              a.verdict === "OVERPRICED" ? "⚠️ OVERPRICED" : "🏷️ UNDERPRICED";
            report += `${i + 1}. **${a.title}** (${a.area} - ${a.category})\n`;
            report += `   - **Status**: ${badge} (+${a.deviationPercent}% vs benchmark)\n`;
            report += `   - **Actual Rate**: ৳ ${a.actualRate}/sqft (Monthly: ৳ ${a.rentBdt.toLocaleString()} for ${a.sizeSqft} sqft)\n`;
            report += `   - **Standard Benchmark**: ${a.expectedRange} BDT/sqft\n\n`;
          });
        } else {
          report += `✅ All listings in the audited scope strictly conform to standard Dhaka neighborhood price-per-sqft guidelines.`;
        }

        return {
          content: [{ type: "text", text: report }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: "text", text: `Error executing ${name}: ${msg}` }],
      isError: true,
    };
  }
});

// Connect to MongoDB and start Stdio Transport
async function main() {
  try {
    console.error(`[Dhaka Rental MCP] Connecting to MongoDB: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.error(`[Dhaka Rental MCP] Connected to MongoDB.`);

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[Dhaka Rental MCP] Server started successfully on stdio.`);
  } catch (error) {
    console.error(`[Dhaka Rental MCP] Fatal error starting server:`, error);
    process.exit(1);
  }
}

main();
