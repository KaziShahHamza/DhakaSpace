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
    title: { type: String, required: true },
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
    address: { type: String, required: true },
    rentBdt: { type: Number, required: true },
    advanceMonths: { type: Number, required: true, default: 2 },
    sizeSqft: { type: Number, required: true },
    bedrooms: { type: Number },
    floor: { type: String, required: true },
    amenities: { type: [String], default: [] },
    description: { type: String, required: true },
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Listing = mongoose.model<IListing>("Listing", ListingSchema);
