export type ListingCategory = "home" | "office" | "shop";

export type DhakaArea =
  | "Gulshan"
  | "Banani"
  | "Dhanmondi"
  | "Mirpur"
  | "Uttara"
  | "Motijheel";

export interface Listing {
  _id: string;
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
  createdAt: string;
}

export interface AreaStat {
  area: DhakaArea;
  category: ListingCategory;
  count: number;
  avgRent: number;
  minRent: number;
  maxRent: number;
  avgSqft: number;
  avgBdtPerSqft: number;
}

export interface Inquiry {
  _id: string;
  listingId: string | Listing;
  renterName: string;
  renterPhone: string;
  preferredDate: string;
  timeSlot: "morning" | "afternoon" | "evening";
  message: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}
