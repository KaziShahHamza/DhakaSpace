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

const TenancyDeedSchema = z.object({
  category: z.enum(["home", "office", "shop"]),
  area: z.enum([
    "Gulshan",
    "Banani",
    "Dhanmondi",
    "Mirpur",
    "Uttara",
    "Motijheel",
  ]),
  monthlyRentBdt: z.number().positive(),
  advanceMonths: z.number().int().min(1).max(24).default(2),
  leaseDurationMonths: z.number().int().min(6).max(120).default(12),
  tenantType: z
    .enum(["family", "bachelor", "corporate", "retail"])
    .optional(),
  landlordName: z.string().optional(),
  tenantName: z.string().optional(),
});

const HoldingTaxSchema = z.object({
  cityCorporation: z.enum(["DNCC", "DSCC"]),
  monthlyRentBdt: z.number().positive(),
  category: z.enum(["home", "office", "shop"]),
  ownerOccupied: z.boolean().default(false),
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
  {
    name: "dhaka_generate_tenancy_deed",
    description:
      "Generate Bangladesh Premises Rent Control Act (1991) compliant tenancy deed clauses and summary for Dhaka properties.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["home", "office", "shop"],
          description: "Property category: home, office, or shop",
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
          description: "Dhaka neighborhood",
        },
        monthlyRentBdt: {
          type: "number",
          description: "Agreed monthly rent in BDT (৳)",
        },
        advanceMonths: {
          type: "number",
          description: "Number of months of security advance deposit (default: 2)",
        },
        leaseDurationMonths: {
          type: "number",
          description: "Lease term duration in months (default: 12)",
        },
        tenantType: {
          type: "string",
          enum: ["family", "bachelor", "corporate", "retail"],
          description: "Optional tenant profile",
        },
        landlordName: {
          type: "string",
          description: "Optional landlord full name",
        },
        tenantName: {
          type: "string",
          description: "Optional tenant full name",
        },
      },
      required: ["category", "area", "monthlyRentBdt"],
    },
  },
  {
    name: "dhaka_calculate_holding_tax",
    description:
      "Calculate estimated annual Dhaka City Corporation (DNCC / DSCC) holding tax based on monthly rental value and property category.",
    inputSchema: {
      type: "object",
      properties: {
        cityCorporation: {
          type: "string",
          enum: ["DNCC", "DSCC"],
          description: "Dhaka North (DNCC) or Dhaka South (DSCC)",
        },
        monthlyRentBdt: {
          type: "number",
          description: "Monthly rent in BDT (৳)",
        },
        category: {
          type: "string",
          enum: ["home", "office", "shop"],
          description: "Property category",
        },
        ownerOccupied: {
          type: "boolean",
          description:
            "Whether the owner occupies the property (applies municipal rebate if true)",
        },
      },
      required: ["cityCorporation", "monthlyRentBdt", "category"],
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

      case "dhaka_generate_tenancy_deed": {
        const validated = TenancyDeedSchema.parse(args);
        const totalAdvanceBdt =
          validated.monthlyRentBdt * validated.advanceMonths;
        const landlord = validated.landlordName || "[Landlord Full Name]";
        const tenant = validated.tenantName || "[Tenant Full Name & NID]";
        const isCommercial =
          validated.category === "office" || validated.category === "shop";

        const clauses: string[] = [
          `1. **Parties & Premises**: Agreement between **${landlord}** (First Party / Landlord) and **${tenant}** (Second Party / Tenant) for a ${validated.category.toUpperCase()} unit located in **${validated.area}, Dhaka**.`,
          `2. **Stamp Duty & Legal Framework**: Executed on a **৳ 300 Non-Judicial Stamp** under the *Bangladesh Premises Rent Control Act, 1991* and *Transfer of Property Act, 1882*.`,
          `3. **Monthly Rent & Payment Schedule**: Monthly rent is fixed at **৳ ${validated.monthlyRentBdt.toLocaleString()}** payable on or before the 10th of each English calendar month via bank transfer or digital banking.`,
          `4. **Security Advance Deposit**: The Tenant has deposited **৳ ${totalAdvanceBdt.toLocaleString()}** (${validated.advanceMonths} months' rent) as an interest-free security deposit, refundable upon handover of vacant possession minus any verified utility arrears or structural damages.`,
          `5. **Lease Term & Notice Period**: Valid for **${validated.leaseDurationMonths} months**. Either party must serve a mandatory **2-month (60 days) written notice** prior to termination or vacating the premises.`,
          `6. **Utilities & Service Charges**: Tenant shall bear actual monthly electricity (DESCO/DPDC), water (WASA), gas (Titas), and building service charges separately unless explicitly bundled.`,
          `7. **No Subletting & Alteration**: The Tenant shall not sublet, assign, or make structural alterations without prior written consent from the Landlord.`,
        ];

        if (isCommercial) {
          clauses.push(
            `8. **Commercial Tax, VAT & Trade License**: Applicable VAT and TDS (Tax Deducted at Source) on commercial rent shall be compliant with NBR (National Board of Revenue) rules. Landlord shall provide necessary holding number and NOC for DNCC/DSCC Trade License registration.`
          );
        } else if (validated.tenantType === "bachelor") {
          clauses.push(
            `8. **DMP Tenant Registration**: All adult occupants must submit NID copies and complete the mandatory Dhaka Metropolitan Police (DMP) Citizen Information Management System (CIMS) tenant form prior to move-in.`
          );
        } else {
          clauses.push(
            `8. **DMP Registration & Society Rules**: Tenant must complete DMP CIMS tenant registration and abide by the building's residential welfare society rules.`
          );
        }

        const deedText = [
          `### Dhaka Tenancy Agreement Summary (${validated.category.toUpperCase()} — ${validated.area})`,
          ``,
          `**Monthly Rent**: ৳ ${validated.monthlyRentBdt.toLocaleString()} | **Advance**: ৳ ${totalAdvanceBdt.toLocaleString()} (${validated.advanceMonths} mo) | **Term**: ${validated.leaseDurationMonths} months`,
          ``,
          `#### Standard Legal Clauses:`,
          ...clauses,
          ``,
          `*Disclaimer: This is a standardized template for convenience and does not constitute formal legal representation. Verify final execution on a ৳ 300 Non-Judicial Stamp with witnesses.*`,
        ].join("\n");

        return {
          content: [{ type: "text", text: deedText }],
        };
      }

      case "dhaka_calculate_holding_tax": {
        const validated = HoldingTaxSchema.parse(args);
        const grossAnnualRent = validated.monthlyRentBdt * 12;
        const maintenanceDeduction = validated.monthlyRentBdt * 2; // 2 months standard statutory maintenance deduction
        const baseAnnualValuation = grossAnnualRent - maintenanceDeduction;
        const rebateMultiplier = validated.ownerOccupied ? 0.6 : 1.0; // 40% rebate if owner-occupied
        const taxableValuation = Math.round(
          baseAnnualValuation * rebateMultiplier
        );

        // Dhaka City Corporation standard municipal tax rate (~12%: 7% holding + 3% conservancy + 2% lighting)
        const municipalTaxRate = 0.12;
        const estimatedAnnualTax = Math.round(
          taxableValuation * municipalTaxRate
        );
        const quarterlyInstallment = Math.round(estimatedAnnualTax / 4);

        const corpName =
          validated.cityCorporation === "DNCC"
            ? "Dhaka North City Corporation (DNCC)"
            : "Dhaka South City Corporation (DSCC)";

        const summary = [
          `### ${corpName} — Holding Tax Estimation`,
          ``,
          `- **Property Category**: ${validated.category.toUpperCase()}`,
          `- **Occupancy**: ${
            validated.ownerOccupied
              ? "Owner-Occupied (40% Municipal Rebate Applied)"
              : "Rented / Commercial"
          }`,
          `- **Monthly Rent**: ৳ ${validated.monthlyRentBdt.toLocaleString()}`,
          `- **Gross Annual Rental Value (12 mo)**: ৳ ${grossAnnualRent.toLocaleString()}`,
          `- **Less Statutory Maintenance Allowance (2 mo)**: -৳ ${maintenanceDeduction.toLocaleString()}`,
          `- **Net Assessed Annual Valuation**: ৳ ${taxableValuation.toLocaleString()}`,
          `- **Combined Municipal Rate**: 12% (7% Holding + 3% Conservancy + 2% Street Lighting)`,
          `- **Estimated Annual Holding Tax**: **৳ ${estimatedAnnualTax.toLocaleString()}**`,
          `- **Estimated Quarterly Installment**: **৳ ${quarterlyInstallment.toLocaleString()}**`,
          ``,
          `*Disclaimer: Educational estimate based on standard Dhaka City Corporation municipal assessment guidelines.*`,
        ].join("\n");

        return {
          content: [{ type: "text", text: summary }],
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
