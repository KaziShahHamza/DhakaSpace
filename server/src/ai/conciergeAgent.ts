import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import dotenv from "dotenv";
import { Listing } from "../models/Listing";
import { Inquiry } from "../models/Inquiry";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// Tool Definitions for the Concierge Agent
const searchListingsTool: FunctionDeclaration = {
  name: "search_dhaka_listings",
  description:
    "Searches active rental listings in Dhaka City matching category, neighborhood, and maximum BDT rent.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        enum: ["home", "office", "shop"],
        description: "Property type (home, office, or shop).",
      },
      area: {
        type: Type.STRING,
        enum: ["Gulshan", "Banani", "Dhanmondi", "Mirpur", "Uttara", "Motijheel"],
        description: "Dhaka neighborhood.",
      },
      maxRentBdt: {
        type: Type.NUMBER,
        description: "Maximum monthly rent budget in Bangladeshi Taka (৳).",
      },
    },
  },
};

const areaStatsTool: FunctionDeclaration = {
  name: "get_dhaka_area_stats",
  description:
    "Retrieves market pricing stats (avg rent, min/max, BDT/sqft) across Dhaka neighborhoods.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      area: {
        type: Type.STRING,
        enum: ["Gulshan", "Banani", "Dhanmondi", "Mirpur", "Uttara", "Motijheel"],
        description: "Specific neighborhood, or omit to view citywide stats.",
      },
    },
  },
};

const bookVisitTool: FunctionDeclaration = {
  name: "book_property_visit",
  description:
    "Books an in-person property visit inquiry for a renter and saves it to the database.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      listingId: {
        type: Type.STRING,
        description: "MongoDB ID of the listing.",
      },
      renterName: {
        type: Type.STRING,
        description: "Name of the person requesting the visit.",
      },
      renterPhone: {
        type: Type.STRING,
        description: "Phone number of the renter (+880 standard).",
      },
      preferredDate: {
        type: Type.STRING,
        description: "Visit date (e.g. YYYY-MM-DD or readable date).",
      },
      timeSlot: {
        type: Type.STRING,
        enum: ["morning", "afternoon", "evening"],
        description: "Preferred time window: morning, afternoon, or evening.",
      },
    },
    required: ["listingId", "renterName", "renterPhone", "preferredDate"],
  },
};

// Tool Execution Handlers
async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  console.log(`[ConciergeAgent] Executing Tool: ${name} with args:`, args);

  switch (name) {
    case "search_dhaka_listings": {
      const filter: Record<string, unknown> = { available: true };
      if (typeof args.category === "string" && args.category !== "all") {
        filter.category = args.category;
      }
      if (typeof args.area === "string" && args.area !== "all") {
        filter.area = args.area;
      }
      if (typeof args.maxRentBdt === "number") {
        filter.rentBdt = { $lte: args.maxRentBdt };
      }

      const listings = await Listing.find(filter)
        .select("_id title category area address rentBdt sizeSqft bedrooms floor contactName contactPhone")
        .sort({ rentBdt: 1 })
        .limit(5);

      return {
        count: listings.length,
        results: listings.map((l) => ({
          id: l._id.toString(),
          title: l.title,
          category: l.category,
          area: l.area,
          rentBdt: l.rentBdt,
          sizeSqft: l.sizeSqft,
          contact: `${l.contactName} (${l.contactPhone})`,
        })),
      };
    }

    case "get_dhaka_area_stats": {
      const matchStage: Record<string, unknown> = { available: true };
      if (typeof args.area === "string" && args.area !== "all") {
        matchStage.area = args.area;
      }

      const stats = await Listing.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { area: "$area", category: "$category" },
            count: { $sum: 1 },
            avgRent: { $avg: "$rentBdt" },
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
            avgBdtPerSqft: {
              $cond: [
                { $gt: ["$avgSqft", 0] },
                { $round: [{ $divide: ["$avgRent", "$avgSqft"] }, 1] },
                0,
              ],
            },
          },
        },
        { $sort: { area: 1 } },
      ]);

      return { stats };
    }

    case "book_property_visit": {
      const listing = await Listing.findById(args.listingId);
      if (!listing) {
        return { success: false, message: "Listing not found with that ID." };
      }

      const inquiry = await Inquiry.create({
        listingId: listing._id,
        renterName: args.renterName || "Interested Renter",
        renterPhone: args.renterPhone || "+8801700000000",
        preferredDate: args.preferredDate || new Date().toISOString().split("T")[0],
        timeSlot: args.timeSlot || "morning",
        message: "Booked via DhakaSpace AI Concierge",
      });

      return {
        success: true,
        inquiryId: inquiry._id.toString(),
        message: `Visit confirmed for '${listing.title}' on ${inquiry.preferredDate} (${inquiry.timeSlot}). Landlord ${listing.contactName} will reach out to ${inquiry.renterPhone}.`,
      };
    }

    default:
      return { error: `Tool ${name} not supported.` };
  }
}

// Conversation Session State
interface ChatTurn {
  role: "user" | "model";
  parts: Array<{ text?: string; functionCall?: any; functionResponse?: any }>;
}

const sessions: Map<string, ChatTurn[]> = new Map();

export async function chatWithConcierge(
  message: string,
  sessionId = "default"
): Promise<{ reply: string; toolCallsExecuted: string[] }> {
  if (!message || !message.trim()) {
    throw new Error("Message cannot be empty.");
  }

  const executedTools: string[] = [];

  // Check if Gemini API Key is configured
  if (apiKey && apiKey !== "your_gemini_api_key_here") {
    try {
      const client = new GoogleGenAI({ apiKey });

      const systemInstruction = `
You are the intelligent Dhaka City Rental Concierge for DhakaSpace (Homes, Offices, and Shops in Dhaka).
You have access to tools to search listings, check market stats, and book property visits.
Neighborhoods in Dhaka: Gulshan, Banani, Dhanmondi, Mirpur, Uttara, Motijheel.
Currency: Always format prices in Bangladeshi Taka (BDT, symbol ৳).
When users ask about availability, find matching listings using search_dhaka_listings.
When users ask about area pricing, use get_dhaka_area_stats.
When a user wants to book or visit a property, call book_property_visit.
Be polite, professional, and knowledgeable about Dhaka neighborhoods.
`;

      let history = sessions.get(sessionId) || [];
      history.push({ role: "user", parts: [{ text: message }] });

      // First call to model with tools
      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: history as any,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: [searchListingsTool, areaStatsTool, bookVisitTool] }],
        },
      });

      // Check if model called a function
      const candidate = response.candidates?.[0];
      const functionCalls = candidate?.content?.parts?.filter((p: any) => p.functionCall);

      if (functionCalls && functionCalls.length > 0) {
        // Record model turn with function call
        history.push({
          role: "model",
          parts: candidate?.content?.parts || [],
        });

        // Execute all requested functions
        const toolResultsParts: any[] = [];
        for (const part of functionCalls) {
          const call = (part as any).functionCall;
          executedTools.push(call.name);
          const result = await executeTool(call.name, call.args || {});
          toolResultsParts.push({
            functionResponse: {
              name: call.name,
              response: result,
            },
          });
        }

        // Add function response turn
        history.push({
          role: "user",
          parts: toolResultsParts,
        });

        // Second turn to get final conversational response
        const secondResponse = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: history as any,
          config: {
            systemInstruction,
          },
        });

        const reply = secondResponse.text || "I have processed your request for DhakaSpace!";
        history.push({ role: "model", parts: [{ text: reply }] });
        sessions.set(sessionId, history.slice(-10)); // Keep last 10 turns

        return { reply, toolCallsExecuted: executedTools };
      }

      // If no tool was called, return standard text response
      const reply = response.text || "I am here to assist you with Dhaka property rentals!";
      history.push({ role: "model", parts: [{ text: reply }] });
      sessions.set(sessionId, history.slice(-10));

      return { reply, toolCallsExecuted: executedTools };
    } catch (err) {
      console.error("[ConciergeAgent] Gemini API call error, using local agent fallback:", err);
    }
  }

  // Local agent fallback when API key is not present or offline
  return fallbackAgent(message);
}

// Fallback agent logic executing database queries directly
async function fallbackAgent(message: string): Promise<{ reply: string; toolCallsExecuted: string[] }> {
  const lower = message.toLowerCase();
  const toolsExecuted: string[] = [];

  if (lower.includes("stats") || lower.includes("average") || lower.includes("rate") || lower.includes("benchmark")) {
    toolsExecuted.push("get_dhaka_area_stats");
    let targetArea: string | undefined = undefined;
    if (lower.includes("gulshan")) targetArea = "Gulshan";
    else if (lower.includes("banani")) targetArea = "Banani";
    else if (lower.includes("dhanmondi")) targetArea = "Dhanmondi";
    else if (lower.includes("mirpur")) targetArea = "Mirpur";
    else if (lower.includes("uttara")) targetArea = "Uttara";
    else if (lower.includes("motijheel")) targetArea = "Motijheel";

    const statsData: any = await executeTool("get_dhaka_area_stats", { area: targetArea });
    if (statsData.stats && statsData.stats.length > 0) {
      const summaryText = statsData.stats
        .slice(0, 4)
        .map((s: any) => `• **${s.area}** (${s.category}): ৳ ${s.avgRent.toLocaleString()}/mo (~৳ ${s.avgBdtPerSqft}/sqft)`)
        .join("\n");
      return {
        reply: `Here are the latest rental benchmarks for Dhaka City:\n\n${summaryText}\n\nWould you like to view active listings in any of these areas?`,
        toolCallsExecuted: toolsExecuted,
      };
    }
  }

  // Search listings by area / category
  toolsExecuted.push("search_dhaka_listings");
  let category: string | undefined;
  if (lower.includes("office")) category = "office";
  else if (lower.includes("shop")) category = "shop";
  else if (lower.includes("home") || lower.includes("flat") || lower.includes("apartment")) category = "home";

  let area: string | undefined;
  if (lower.includes("gulshan")) area = "Gulshan";
  else if (lower.includes("banani")) area = "Banani";
  else if (lower.includes("dhanmondi")) area = "Dhanmondi";
  else if (lower.includes("mirpur")) area = "Mirpur";
  else if (lower.includes("uttara")) area = "Uttara";
  else if (lower.includes("motijheel")) area = "Motijheel";

  const searchData: any = await executeTool("search_dhaka_listings", { category, area });

  if (searchData.results && searchData.results.length > 0) {
    const listText = searchData.results
      .map(
        (r: any) =>
          `• **${r.title}** in ${r.area}\n  Rent: ৳ ${r.rentBdt.toLocaleString()} (${r.sizeSqft} sqft) | Contact: ${r.contact}`
      )
      .join("\n\n");
    return {
      reply: `I found ${searchData.count} property option(s) in Dhaka:\n\n${listText}\n\nWould you like me to help you schedule a visit to any of these?`,
      toolCallsExecuted: toolsExecuted,
    };
  }

  return {
    reply: `Assalamu Alaikum! I can help you search properties, compare average rents across Gulshan, Banani, Dhanmondi, Mirpur, Uttara, and Motijheel, or schedule a property visit. What type of space (home, office, or shop) are you looking for?`,
    toolCallsExecuted: [],
  };
}
