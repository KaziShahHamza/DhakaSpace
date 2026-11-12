import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Inquiry } from "../models/Inquiry";
import { Listing } from "../models/Listing";

export const inquiriesRouter = Router();

const createInquirySchema = z.object({
  listingId: z.string(),
  renterName: z.string().min(2, "Name must be at least 2 characters"),
  renterPhone: z.string().min(6, "Valid contact number required"),
  preferredDate: z.string().min(4, "Preferred date is required"),
  timeSlot: z.enum(["morning", "afternoon", "evening"]).default("morning"),
  message: z.string().optional().default(""),
});

// POST /api/inquiries - Submit visit inquiry
inquiriesRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createInquirySchema.parse(req.body);

    const listing = await Listing.findById(validated.listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const inquiry = await Inquiry.create(validated);
    res.status(201).json({ success: true, data: inquiry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    next(error);
  }
});

// GET /api/inquiries - List visit inquiries
inquiriesRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const inquiries = await Inquiry.find()
      .populate("listingId", "title category area address rentBdt")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/inquiries/:id/status
inquiriesRouter.patch("/:id/status", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const updated = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});
