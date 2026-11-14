import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

// JSON Schema for structured listing extraction
export const listingAutofillSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Concise, appealing listing title mentioning key features and area.",
    },
    category: {
      type: "string",
      enum: ["home", "office", "shop"],
      description: "Property category: home (residential), office (commercial), or shop (retail).",
    },
    area: {
      type: "string",
      enum: ["Gulshan", "Banani", "Dhanmondi", "Mirpur", "Uttara", "Motijheel"],
      description: "Dhaka neighborhood where the property is located.",
    },
    address: {
      type: "string",
      description: "Detailed street or road address in Dhaka.",
    },
    rentBdt: {
      type: "integer",
      description: "Monthly rental price in Bangladeshi Taka (BDT). Convert lakhs (e.g. 1.2 lakh = 120000) or thousands (e.g. 45k = 45000) to raw numbers.",
    },
    advanceMonths: {
      type: "integer",
      description: "Number of months advance/security deposit required (default 2).",
    },
    sizeSqft: {
      type: "integer",
      description: "Total property area in square feet (sqft).",
    },
    bedrooms: {
      type: "integer",
      description: "Number of bedrooms if residential home, otherwise null.",
    },
    floor: {
      type: "string",
      description: "Floor level, e.g. '4th Floor' or 'Ground Floor'.",
    },
    amenities: {
      type: "array",
      items: { type: "string" },
      description: "List of key features, e.g. 'Full Generator Backup', 'Elevator', '2 Car Parking', 'Titas Gas'.",
    },
    description: {
      type: "string",
      description: "Well-crafted, professional 2-3 sentence overview highlighting the space, lighting, and Dhaka connectivity.",
    },
    contactName: {
      type: "string",
      description: "Landlord, owner, or agent contact name.",
    },
    contactPhone: {
      type: "string",
      description: "Phone number formatted with Bangladesh standard (+880 or 017...).",
    },
  },
  required: [
    "title",
    "category",
    "area",
    "address",
    "rentBdt",
    "sizeSqft",
    "floor",
    "amenities",
    "description",
  ],
};

export interface AutofillResult {
  title: string;
  category: "home" | "office" | "shop";
  area: "Gulshan" | "Banani" | "Dhanmondi" | "Mirpur" | "Uttara" | "Motijheel";
  address: string;
  rentBdt: number;
  advanceMonths: number;
  sizeSqft: number;
  bedrooms?: number;
  floor: string;
  amenities: string[];
  description: string;
  contactName?: string;
  contactPhone?: string;
}

export async function parseLandlordNotes(notes: string): Promise<AutofillResult> {
  if (!notes || !notes.trim()) {
    throw new Error("Notes cannot be empty.");
  }

  // 1. If GEMINI_API_KEY is configured, call @google/genai
  if (apiKey && apiKey !== "your_gemini_api_key_here") {
    try {
      const client = new GoogleGenAI({ apiKey });

      const prompt = `
You are the expert Dhaka City Real-Estate Assistant for DhakaSpace.
A landlord provided the following messy shorthand notes for a rental listing in Dhaka:
"""
${notes.trim()}
"""

Extract and normalize all property details into the required JSON Schema.
Important Dhaka Domain Rules:
- Currency: convert "lakh" (e.g. 1.5 lakh = 150000, 85k = 85000) into integer BDT.
- Neighborhood: must be one of Gulshan, Banani, Dhanmondi, Mirpur, Uttara, Motijheel.
- Category: home, office, or shop.
- Craft a clear, professional description and title.
`;

      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: listingAutofillSchema,
        },
      });

      const responseText = response.text;
      if (responseText) {
        return JSON.parse(responseText) as AutofillResult;
      }
    } catch (err) {
      console.error("[AutofillService] Gemini API call failed, using heuristic fallback:", err);
    }
  }

  // 2. Heuristic fallback when running in offline/demo mode without API key
  console.log("[AutofillService] Using intelligent local parser (no active Gemini API key).");
  return fallbackHeuristicParser(notes);
}

function fallbackHeuristicParser(notes: string): AutofillResult {
  const lower = notes.toLowerCase();

  // Detect category
  let category: "home" | "office" | "shop" = "home";
  if (lower.includes("office") || lower.includes("commercial") || lower.includes("floorplate")) {
    category = "office";
  } else if (lower.includes("shop") || lower.includes("showroom") || lower.includes("outlet") || lower.includes("store")) {
    category = "shop";
  }

  // Detect area
  let area: "Gulshan" | "Banani" | "Dhanmondi" | "Mirpur" | "Uttara" | "Motijheel" = "Banani";
  if (lower.includes("gulshan")) area = "Gulshan";
  else if (lower.includes("banani")) area = "Banani";
  else if (lower.includes("dhanmondi")) area = "Dhanmondi";
  else if (lower.includes("mirpur")) area = "Mirpur";
  else if (lower.includes("uttara")) area = "Uttara";
  else if (lower.includes("motijheel")) area = "Motijheel";

  // Detect sqft
  const sqftMatch = lower.match(/(\d+)\s*(?:sqft|sft|sq\.?\s*ft)/);
  const sizeSqft = sqftMatch ? parseInt(sqftMatch[1], 10) : 1500;

  // Detect rent (e.g. 1.2 lakh, 90k, 45000)
  let rentBdt = 60000;
  const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac)/);
  const kMatch = lower.match(/(\d+)\s*k\b/);
  const rawNumMatch = lower.match(/rent\s*(?:is|:)?\s*(\d{4,7})/);

  if (lakhMatch) {
    rentBdt = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else if (kMatch) {
    rentBdt = parseInt(kMatch[1], 10) * 1000;
  } else if (rawNumMatch) {
    rentBdt = parseInt(rawNumMatch[1], 10);
  }

  // Detect bed
  const bedMatch = lower.match(/(\d+)\s*(?:bed|bedroom)/);
  const bedrooms = bedMatch ? parseInt(bedMatch[1], 10) : category === "home" ? 3 : undefined;

  // Detect floor
  const floorMatch = lower.match(/(\d+)(?:st|nd|rd|th)?\s*floor/);
  const floor = floorMatch ? `${floorMatch[1]}th Floor` : "3rd Floor";

  // Detect amenities
  const amenities: string[] = [];
  if (lower.includes("generator") || lower.includes("power backup")) amenities.push("Full Generator Backup");
  if (lower.includes("lift") || lower.includes("elevator")) amenities.push("Elevator");
  if (lower.includes("park") || lower.includes("parking")) amenities.push("Dedicated Parking");
  if (lower.includes("cctv") || lower.includes("security")) amenities.push("24/7 Security & CCTV");
  if (lower.includes("gas") || lower.includes("titas")) amenities.push("Titas Gas Line");

  return {
    title: `Spacious ${category === "home" ? `${bedrooms || 3}-Bed` : category.toUpperCase()} in ${area}`,
    category,
    area,
    address: `${area}, Dhaka`,
    rentBdt,
    advanceMonths: 2,
    sizeSqft,
    bedrooms,
    floor,
    amenities: amenities.length > 0 ? amenities : ["Lift", "Generator Backup", "24/7 Guard"],
    description: `Conveniently situated in ${area}, Dhaka. Well-ventilated ${sizeSqft} sqft space on the ${floor} with reliable utilities.`,
    contactName: "Property Owner",
    contactPhone: "+8801700000000",
  };
}
