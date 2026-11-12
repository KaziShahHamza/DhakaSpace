import mongoose, { Schema, Document } from "mongoose";

export type ListingCategory = "home" | "office" | "shop";
export type DhakaArea =
  | "Gulshan"
  | "Banani"
  | "Dhanmondi"
  | "Mirpur"
  | "Uttara"
  | "Motijheel";

export interface IListing extends Document {
  title: string;
  category: ListingCategory;
  area: DhakaArea;
  address: string;
  rentBdt: number;
  advanceMonths: number;
  sizeSqft: number;
  bedrooms?: number;
  floor: string;
  amenities: string[];
  description: string;
  contactName: string;
  contactPhone: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["home", "office", "shop"],
    },
    area: {
      type: String,
      required: true,
      enum: ["Gulshan", "Banani", "Dhanmondi", "Mirpur", "Uttara", "Motijheel"],
    },
    address: { type: String, required: true, trim: true },
    rentBdt: { type: Number, required: true, min: 1000 },
    advanceMonths: { type: Number, required: true, default: 2, min: 1 },
    sizeSqft: { type: Number, required: true, min: 50 },
    bedrooms: { type: Number, required: false },
    floor: { type: String, required: true, default: "1st Floor" },
    amenities: { type: [String], default: [] },
    description: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for fast Dhaka filtering and searching
ListingSchema.index({ category: 1, area: 1, rentBdt: 1 });
ListingSchema.index({ title: "text", description: "text", address: "text" });

export const Listing = mongoose.model<IListing>("Listing", ListingSchema);
