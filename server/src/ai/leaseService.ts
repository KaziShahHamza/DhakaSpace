import { DEFAULT_GEMINI_MODEL, getGeminiClient } from "./geminiClient";

export interface LeaseInput {
  area: "Gulshan" | "Banani" | "Dhanmondi" | "Mirpur" | "Uttara" | "Motijheel";
  category: "home" | "office" | "shop";
  sizeSqft: number;
  rentBdt: number;
  advanceMonths: number;
  address?: string;
  landlordName?: string;
  tenantName?: string;
  noticeMonths?: number;
  termMonths?: number;
}

export interface LeaseClause {
  heading: string;
  body: string;
}

export interface GeneratedLease {
  title: string;
  governingLaw: string;
  stampRequirement: string;
  summary: {
    propertyType: string;
    location: string;
    sizeSqft: number;
    monthlyRentBdt: number;
    advanceDepositBdt: number;
    advanceMonths: number;
    termMonths: number;
    noticeMonths: number;
    landlordName: string;
    tenantName: string;
  };
  clauses: LeaseClause[];
  complianceNotes: string[];
  holdingTaxNote: string;
  disclaimer: string;
}

const leaseResponseSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    governingLaw: { type: "string" },
    stampRequirement: { type: "string" },
    clauses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          body: { type: "string" },
        },
        required: ["heading", "body"],
      },
    },
    complianceNotes: {
      type: "array",
      items: { type: "string" },
    },
    holdingTaxNote: { type: "string" },
    disclaimer: { type: "string" },
  },
  required: [
    "title",
    "governingLaw",
    "stampRequirement",
    "clauses",
    "complianceNotes",
    "holdingTaxNote",
    "disclaimer",
  ],
};

function getCorporation(area: LeaseInput["area"]): "DNCC" | "DSCC" {
  return area === "Dhanmondi" || area === "Motijheel" ? "DSCC" : "DNCC";
}

export async function generateTenancyDeed(
  input: LeaseInput
): Promise<GeneratedLease> {
  const noticeMonths = input.noticeMonths ?? 2;
  const termMonths = input.termMonths ?? 11;
  const landlordName = input.landlordName?.trim() || "First Party (Landlord)";
  const tenantName = input.tenantName?.trim() || "Second Party (Tenant)";
  const advanceDepositBdt = input.rentBdt * input.advanceMonths;
  const location = input.address?.trim()
    ? `${input.address.trim()}, ${input.area}, Dhaka`
    : `${input.area}, Dhaka`;
  const corp = getCorporation(input.area);

  const summary = {
    propertyType: input.category,
    location,
    sizeSqft: input.sizeSqft,
    monthlyRentBdt: input.rentBdt,
    advanceDepositBdt,
    advanceMonths: input.advanceMonths,
    termMonths,
    noticeMonths,
    landlordName,
    tenantName,
  };

  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `
You are a Dhaka Real Estate Attorney drafting a standardized tenancy agreement under the Bangladesh Premises Rent Control Act, 1991 and Transfer of Property Act, 1882.

Property & Party Details:
- Category: ${input.category}
- Location: ${location} (${corp} jurisdiction)
- Size: ${input.sizeSqft} sqft
- Monthly Rent: ৳ ${input.rentBdt.toLocaleString()}
- Security Advance: ৳ ${advanceDepositBdt.toLocaleString()} (${input.advanceMonths} months)
- Term: ${termMonths} months
- Notice Period: ${noticeMonths} months
- Landlord (First Party): ${landlordName}
- Tenant (Second Party): ${tenantName}

Requirements:
- All monetary values MUST be in BDT (৳) and area in sqft.
- Specify execution on a ৳ 300 Non-Judicial Stamp with two witnesses.
- Include clauses for Rent Payment (due by 10th), Security Advance Deposit, Utilities & Service Charges (DESCO/DPDC, WASA, Titas Gas/LPG), Maintenance, Termination Notice (${noticeMonths} months), and Rent Escalation.
- For "home", include DMP CIMS (Dhaka Metropolitan Police Citizen Information Management System) tenant registration in complianceNotes.
- For "office" or "shop", include NBR VAT/TDS obligations and ${corp} Trade License NOC in complianceNotes.
- Include a clear legal disclaimer stating this is a standardized template, not formal legal representation.
- Do not fabricate unprovided amenities (like parking or Titas gas connection).
`;

      const response = await client.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: leaseResponseSchema,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text) as Omit<GeneratedLease, "summary">;
        return { ...parsed, summary };
      }
    } catch (err) {
      console.error("[LeaseService] Gemini call failed, using deterministic template:", err);
    }
  }

  return buildFallbackLease(input, summary, corp);
}

function buildFallbackLease(
  input: LeaseInput,
  summary: GeneratedLease["summary"],
  corp: "DNCC" | "DSCC"
): GeneratedLease {
  const isCommercial = input.category === "office" || input.category === "shop";
  const utilityAuthority = corp === "DNCC" ? "DESCO" : "DPDC";

  const complianceNotes = isCommercial
    ? [
        `NBR VAT & TDS: Commercial tenant must deduct applicable Tax Deducted at Source (TDS) and remit VAT as per National Board of Revenue (NBR) rules.`,
        `${corp} Trade License NOC: Landlord shall provide the building holding number, rent receipts, and No Objection Certificate (NOC) for ${corp} Trade License issuance.`,
      ]
    : [
        `DMP CIMS Registration: Under Dhaka Metropolitan Police directives, Landlord and Tenant must submit the Citizen Information Management System (CIMS) tenant verification form with NID copies to the local Thana.`,
      ];

  return {
    title: `Tenancy Agreement (${input.category.toUpperCase()}) — ${input.area}, Dhaka`,
    governingLaw:
      "Bangladesh Premises Rent Control Act, 1991 (বাড়ি ভাড়া নিয়ন্ত্রণ আইন, ১৯৯১) & Transfer of Property Act, 1882",
    stampRequirement:
      "৳ 300 Non-Judicial Stamp (নন-জুডিশিয়াল স্ট্যাম্প) signed by Landlord, Tenant, and at least two (2) witnesses",
    summary,
    clauses: [
      {
        heading: "1. Demised Premises & Term",
        body: `The First Party (${summary.landlordName}) lets out the ${input.sizeSqft} sqft ${input.category} space at ${summary.location} to the Second Party (${summary.tenantName}) for a renewable term of ${summary.termMonths} months.`,
      },
      {
        heading: "2. Monthly Rent & Payment Schedule",
        body: `Monthly rent is fixed at ৳ ${input.rentBdt.toLocaleString()} (BDT), payable on or before the 10th day of each English calendar month via bank transfer, crossed cheque, or agreed digital channel.`,
      },
      {
        heading: "3. Security Advance Deposit",
        body: `The Second Party has paid an interest-free security advance of ৳ ${summary.advanceDepositBdt.toLocaleString()} (${input.advanceMonths} months' rent), refundable upon vacant handover minus verified utility arrears or structural damage beyond normal wear and tear.`,
      },
      {
        heading: "4. Utilities & Building Service Charges",
        body: `Actual consumption bills for electricity (${utilityAuthority}), water (Dhaka WASA), gas, and monthly building service charges (lift, security, common generator, cleaning) shall be settled separately by the Tenant unless otherwise agreed in writing.`,
      },
      {
        heading: "5. Termination Notice & Escalation",
        body: `Either party may terminate this tenancy by serving ${summary.noticeMonths} months (${summary.noticeMonths * 30} days) prior written notice. Rent may be mutually reviewed every 2 years.`,
      },
    ],
    complianceNotes,
    holdingTaxNote: `${corp} Holding Tax Jurisdiction: Annual municipal holding tax on the premises falls under ${corp === "DNCC" ? "Dhaka North City Corporation (DNCC)" : "Dhaka South City Corporation (DSCC)"} assessment rules.`,
    disclaimer:
      "Disclaimer: This document is a standardized template generated for convenience under the Bangladesh Premises Rent Control Act, 1991 and does not constitute formal legal representation. Parties should verify final terms before executing on a ৳ 300 Non-Judicial Stamp.",
  };
}
