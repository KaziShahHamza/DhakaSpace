import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { parseLandlordNotes } from "../ai/autofillService";
import { chatWithConcierge } from "../ai/conciergeAgent";
import { generateTenancyDeed } from "../ai/leaseService";
import { generateAdCopy } from "../ai/adCopyService";

export const aiRouter = Router();

const dhakaAreaEnum = z.enum([
  "Gulshan",
  "Banani",
  "Dhanmondi",
  "Mirpur",
  "Uttara",
  "Motijheel",
]);

const categoryEnum = z.enum(["home", "office", "shop"]);

const autofillRequestSchema = z.object({
  notes: z.string().min(5, "Notes must be at least 5 characters"),
});

const chatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  sessionId: z.string().optional().default("default"),
});

const leaseRequestSchema = z.object({
  area: dhakaAreaEnum,
  category: categoryEnum,
  sizeSqft: z.number().int().positive(),
  rentBdt: z.number().int().positive(),
  advanceMonths: z.number().int().min(0).max(24).default(2),
  address: z.string().optional(),
  landlordName: z.string().optional(),
  tenantName: z.string().optional(),
  noticeMonths: z.number().int().min(1).max(12).optional(),
  termMonths: z.number().int().min(1).max(60).optional(),
});

const adCopyRequestSchema = z.object({
  title: z.string().min(2),
  category: categoryEnum,
  area: dhakaAreaEnum,
  address: z.string().optional(),
  rentBdt: z.number().int().positive(),
  advanceMonths: z.number().int().min(0).max(24).default(2),
  sizeSqft: z.number().int().positive(),
  bedrooms: z.number().int().min(0).optional().nullable(),
  floor: z.string().default("1st Floor"),
  amenities: z.array(z.string()).default([]),
  contactPhone: z.string().optional(),
});

// POST /api/ai/autofill - Structured Extraction with Gemini 3.8 Flash
aiRouter.post(
  "/autofill",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = autofillRequestSchema.parse(req.body);
      const parsedData = await parseLandlordNotes(validated.notes);
      res.json({ success: true, data: parsedData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      next(error);
    }
  }
);

// POST /api/ai/chat - Multi-turn Concierge Agent with Tool Calling
aiRouter.post(
  "/chat",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = chatRequestSchema.parse(req.body);
      const result = await chatWithConcierge(
        validated.message,
        validated.sessionId
      );
      res.json({
        success: true,
        reply: result.reply,
        toolCallsExecuted: result.toolCallsExecuted,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      next(error);
    }
  }
);

// POST /api/ai/generate-lease - Bangladesh Premises Rent Control Act Tenancy Deed
aiRouter.post(
  "/generate-lease",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = leaseRequestSchema.parse(req.body);
      const lease = await generateTenancyDeed(validated);
      res.json({ success: true, data: lease });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      next(error);
    }
  }
);

// POST /api/ai/generate-ad-copy - Multi-Channel Bilingual Ad Copy (FB, Bikroy, Bangla)
aiRouter.post(
  "/generate-ad-copy",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = adCopyRequestSchema.parse(req.body);
      const copy = await generateAdCopy({
        ...validated,
        bedrooms: validated.bedrooms ?? undefined,
      });
      res.json({ success: true, data: copy });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      next(error);
    }
  }
);
