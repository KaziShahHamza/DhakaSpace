import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Listing } from "../models/Listing";

export const listingsRouter = Router();

const createListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.enum(["home", "office", "shop"]),
  area: z.enum(["Gulshan", "Banani", "Dhanmondi", "Mirpur", "Uttara", "Motijheel"]),
  address: z.string().min(5),
  rentBdt: z.number().positive("Rent must be positive in BDT"),
  advanceMonths: z.number().min(1).default(2),
  sizeSqft: z.number().positive("Size must be positive in sqft"),
  bedrooms: z.number().optional(),
  floor: z.string().default("1st Floor"),
  amenities: z.array(z.string()).default([]),
  description: z.string().min(10),
  contactName: z.string().min(2),
  contactPhone: z.string().min(6),
});

// GET /api/listings - Filter & Search
listingsRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, area, maxRent, minSqft, q } = req.query;
    const filter: Record<string, unknown> = { available: true };

    if (category && typeof category === "string" && category !== "all") {
      filter.category = category;
    }
    if (area && typeof area === "string" && area !== "all") {
      filter.area = area;
    }
    if (maxRent) {
      const parsedMax = Number(maxRent);
      if (!isNaN(parsedMax)) {
        filter.rentBdt = { $lte: parsedMax };
      }
    }
    if (minSqft) {
      const parsedMin = Number(minSqft);
      if (!isNaN(parsedMin)) {
        filter.sizeSqft = { $gte: parsedMin };
      }
    }
    if (q && typeof q === "string" && q.trim()) {
      filter.$text = { $search: q.trim() };
    }

    const listings = await Listing.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: listings.length, data: listings });
  } catch (error) {
    next(error);
  }
});

// GET /api/listings/stats - Dhaka Area & Category Aggregations
listingsRouter.get("/stats", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await Listing.aggregate([
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
            $round: [{ $divide: ["$avgRent", "$avgSqft"] }, 1],
          },
        },
      },
      { $sort: { area: 1, category: 1 } },
    ]);

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// GET /api/listings/:id
listingsRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    res.json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
});

// POST /api/listings - Create listing
listingsRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createListingSchema.parse(req.body);
    const newListing = await Listing.create(validated);
    res.status(201).json({ success: true, data: newListing });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    next(error);
  }
});

// DELETE /api/listings/:id
listingsRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await Listing.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    res.json({ success: true, message: "Listing removed successfully" });
  } catch (error) {
    next(error);
  }
});
