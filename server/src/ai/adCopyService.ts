import { DEFAULT_GEMINI_MODEL, getGeminiClient } from "./geminiClient";

export interface AdCopyInput {
  title: string;
  category: "home" | "office" | "shop";
  area: "Gulshan" | "Banani" | "Dhanmondi" | "Mirpur" | "Uttara" | "Motijheel";
  address?: string;
  rentBdt: number;
  advanceMonths: number;
  sizeSqft: number;
  bedrooms?: number;
  floor: string;
  amenities: string[];
  contactPhone?: string;
}

export interface GeneratedAdCopy {
  facebookPost: string;
  bikroyListing: {
    seoTitle: string;
    body: string;
  };
  banglaAd: string;
}

const adCopyResponseSchema = {
  type: "object",
  properties: {
    facebookPost: { type: "string" },
    bikroyListing: {
      type: "object",
      properties: {
        seoTitle: { type: "string" },
        body: { type: "string" },
      },
      required: ["seoTitle", "body"],
    },
    banglaAd: { type: "string" },
  },
  required: ["facebookPost", "bikroyListing", "banglaAd"],
};

export async function generateAdCopy(
  input: AdCopyInput
): Promise<GeneratedAdCopy> {
  const client = getGeminiClient();
  const amenitiesText =
    input.amenities.length > 0 ? input.amenities.join(", ") : "Standard utilities";

  if (client) {
    try {
      const prompt = `
You are a Senior Bilingual Dhaka Real-Estate Marketer for DhakaSpace.
Generate 3 distinct rental ad variants for the following verified property:
- Title: ${input.title}
- Category: ${input.category}
- Area: ${input.area}, Dhaka
- Address: ${input.address || `${input.area}, Dhaka`}
- Size: ${input.sizeSqft} sqft
- Monthly Rent: ৳ ${input.rentBdt.toLocaleString()}
- Advance: ${input.advanceMonths} months
- Floor: ${input.floor}
- Bedrooms: ${input.bedrooms ?? "N/A"}
- Verified Amenities: ${amenitiesText}
- Contact: ${input.contactPhone || "Contact via DhakaSpace"}

Strict Rules:
- Express ALL monetary values in BDT (৳) and dimensions in sqft.
- ZERO SPEC FABRICATION: Do NOT invent any amenity not listed above (e.g., do not add Titas gas, parking, or lakeview unless present).
- 1) facebookPost: Engaging emoji-anchored English post for Dhaka To-Let Facebook groups.
- 2) bikroyListing: Clean, factual SEO title ("[Size] sqft [Category] for Rent in [Area], Dhaka") and structured description.
- 3) banglaAd: Natural, idiomatic Dhaka Bengali ad (ফ্ল্যাট ভাড়া হবে / অফিস স্পেস ভাড়া / দোকান ভাড়া) for WhatsApp & local groups.
`;

      const response = await client.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: adCopyResponseSchema,
        },
      });

      if (response.text) {
        return JSON.parse(response.text) as GeneratedAdCopy;
      }
    } catch (err) {
      console.error("[AdCopyService] Gemini call failed, using deterministic template:", err);
    }
  }

  return buildFallbackAdCopy(input, amenitiesText);
}

function buildFallbackAdCopy(
  input: AdCopyInput,
  amenitiesText: string
): GeneratedAdCopy {
  const categoryLabel =
    input.category === "home"
      ? "Apartment / Flat"
      : input.category === "office"
        ? "Commercial Office Space"
        : "Retail Shop / Showroom";

  const banglaCategory =
    input.category === "home"
      ? "ফ্ল্যাট ভাড়া হবে"
      : input.category === "office"
        ? "অফিস স্পেস ভাড়া হবে"
        : "দোকান / শোরুম ভাড়া হবে";

  const contact = input.contactPhone || "DhakaSpace Listing Contact";
  const bedLine = input.bedrooms ? `\n- Bedrooms: ${input.bedrooms}` : "";

  return {
    facebookPost: `🏠 TO-LET | ${input.title} (${input.area}, Dhaka)

📍 Location: ${input.address || `${input.area}, Dhaka`}
📐 Size: ${input.sizeSqft} sqft | Floor: ${input.floor}${bedLine}
💰 Monthly Rent: ৳ ${input.rentBdt.toLocaleString()}
🔐 Advance Deposit: ${input.advanceMonths} months

✨ Verified Features: ${amenitiesText}

📞 Contact to schedule a visit: ${contact}`,
    bikroyListing: {
      seoTitle: `${input.sizeSqft} sqft ${categoryLabel} for Rent in ${input.area}, Dhaka`,
      body: `Property Type: ${categoryLabel}
Location: ${input.address || `${input.area}, Dhaka`}
Floor Area: ${input.sizeSqft} sqft
Floor Level: ${input.floor}${bedLine}
Monthly Rent: ৳ ${input.rentBdt.toLocaleString()}
Advance Deposit: ${input.advanceMonths} months
Features: ${amenitiesText}
Contact: ${contact}`,
    },
    banglaAd: `📢 ${banglaCategory} — ${input.area}, ঢাকা

📍 ঠিকানা: ${input.address || `${input.area}, ঢাকা`}
📐 আয়তন: ${input.sizeSqft} sqft | তলা: ${input.floor}${input.bedrooms ? ` | বেডরুম: ${input.bedrooms}টি` : ""}
💰 মাসিক ভাড়া: ৳ ${input.rentBdt.toLocaleString()}
🔐 অগ্রিম: ${input.advanceMonths} মাস

✅ সুবিধাসমূহ: ${amenitiesText}

📞 পরিদর্শন ও বিস্তারিত জানতে যোগাযোগ করুন: ${contact}`,
  };
}
