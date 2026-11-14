import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { parseLandlordNotes } from "../ai/autofillService";
import { chatWithConcierge } from "../ai/conciergeAgent";

export const aiRouter = Router();

const autofillRequestSchema = z.object({
  notes: z.string().min(5, "Notes must be at least 5 characters"),
});

const chatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  sessionId: z.string().optional().default("default"),
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
