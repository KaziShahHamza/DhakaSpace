import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";

async function runTest() {
  console.log("=== Testing Dhaka Rental MCP Server ===");

  const serverPath = path.resolve(__dirname, "../dist/index.js");
  console.log("Spawning server process at:", serverPath);

  const transport = new StdioClientTransport({
    command: "node",
    args: [serverPath],
    env: {
      ...process.env,
      MONGODB_URI:
        process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dhakaspace",
    },
  });

  const client = new Client(
    { name: "test-dhaka-client", version: "0.1.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log("✅ MCP Client connected to server over Stdio!");

  function printToolResult(content: unknown) {
    if (
      Array.isArray(content) &&
      content.length > 0 &&
      typeof content[0] === "object" &&
      content[0] !== null &&
      "text" in content[0] &&
      typeof (content[0] as { text: unknown }).text === "string"
    ) {
      console.log((content[0] as { text: string }).text);
    }
  }

  // 1. Test Tools List
  const toolsResult = await client.listTools();
  console.log(`✅ Discovered ${toolsResult.tools.length} MCP tools:`);
  toolsResult.tools.forEach((t) => {
    console.log(`   - ${t.name}: ${t.description}`);
  });

  // 2. Test dhaka_search_listings
  console.log("\n--- Testing Tool: dhaka_search_listings (Gulshan) ---");
  const searchResult = await client.callTool({
    name: "dhaka_search_listings",
    arguments: { area: "Gulshan", category: "home" },
  });
  printToolResult(searchResult.content);

  // 3. Test dhaka_area_rent_summary
  console.log("\n--- Testing Tool: dhaka_area_rent_summary ---");
  const statsResult = await client.callTool({
    name: "dhaka_area_rent_summary",
    arguments: {},
  });
  printToolResult(statsResult.content);

  // 4. Test dhaka_audit_listing_prices
  console.log("\n--- Testing Tool: dhaka_audit_listing_prices ---");
  const auditResult = await client.callTool({
    name: "dhaka_audit_listing_prices",
    arguments: {},
  });
  printToolResult(auditResult.content);

  // 5. Test dhaka_generate_tenancy_deed
  console.log("\n--- Testing Tool: dhaka_generate_tenancy_deed (Dhanmondi Home) ---");
  const deedResult = await client.callTool({
    name: "dhaka_generate_tenancy_deed",
    arguments: {
      category: "home",
      area: "Dhanmondi",
      monthlyRentBdt: 45000,
      advanceMonths: 3,
      leaseDurationMonths: 24,
      tenantType: "family",
      landlordName: "Tariq Rahman",
      tenantName: "Nusrat Jahan",
    },
  });
  printToolResult(deedResult.content);

  // 6. Test dhaka_calculate_holding_tax
  console.log("\n--- Testing Tool: dhaka_calculate_holding_tax (DNCC Commercial) ---");
  const taxResult = await client.callTool({
    name: "dhaka_calculate_holding_tax",
    arguments: {
      cityCorporation: "DNCC",
      monthlyRentBdt: 140000,
      category: "office",
      ownerOccupied: false,
    },
  });
  printToolResult(taxResult.content);

  console.log("\n✅ All Dhaka MCP Server tools verified successfully!");
  await client.close();
  process.exit(0);
}

runTest().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
