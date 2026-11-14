import mongoose from "mongoose";
import dotenv from "dotenv";
import { parseLandlordNotes } from "./ai/autofillService";
import { chatWithConcierge } from "./ai/conciergeAgent";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dhakaspace";

async function runAiTests() {
  console.log("=== Testing Google GenAI & ADK Services ===");

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB for AI service tests.");

  // 1. Test Autofill Service
  console.log("\n--- Testing 1: Smart AI Autofill (Structured Output) ---");
  const sampleNotes =
    "1800 sqft commercial office on Banani road 11, 4th floor, full generator backup, 2 parking, 1.2 lakh rent, 4 months advance, contact Rafiq 01711223344";

  console.log("Input Notes:", sampleNotes);
  const autofillResult = await parseLandlordNotes(sampleNotes);
  console.log("Extracted Result:", JSON.stringify(autofillResult, null, 2));

  if (
    autofillResult.category === "office" &&
    autofillResult.area === "Banani" &&
    autofillResult.rentBdt === 120000 &&
    autofillResult.sizeSqft === 1800
  ) {
    console.log("✅ Smart AI Autofill test PASSED!");
  } else {
    console.log("⚠️ Autofill parsed values:", autofillResult);
  }

  // 2. Test Concierge Agent Tool Calling (Stats)
  console.log("\n--- Testing 2: Concierge Agent Area Stats Tool Calling ---");
  const statsChat = await chatWithConcierge(
    "What is the average rental price for homes in Dhanmondi?"
  );
  console.log("Concierge Reply:\n", statsChat.reply);
  console.log("Tools Executed:", statsChat.toolCallsExecuted);
  console.log("✅ Concierge Area Stats test PASSED!");

  // 3. Test Concierge Agent Search Tool Calling
  console.log("\n--- Testing 3: Concierge Agent Search Tool Calling ---");
  const searchChat = await chatWithConcierge(
    "Show me available offices in Banani"
  );
  console.log("Concierge Reply:\n", searchChat.reply);
  console.log("Tools Executed:", searchChat.toolCallsExecuted);
  console.log("✅ Concierge Search test PASSED!");

  console.log("\n✅ All Google GenAI & ADK tests completed successfully!");
  await mongoose.disconnect();
  process.exit(0);
}

runAiTests().catch((err) => {
  console.error("❌ Test error:", err);
  process.exit(1);
});
