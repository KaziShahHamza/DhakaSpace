import mongoose, { Schema, Document } from "mongoose";

export interface IInquiry extends Document {
  listingId: mongoose.Types.ObjectId;
  renterName: string;
  renterPhone: string;
  preferredDate: string;
  timeSlot: "morning" | "afternoon" | "evening";
  message: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    renterName: { type: String, required: true, trim: true },
    renterPhone: { type: String, required: true, trim: true },
    preferredDate: { type: String, required: true },
    timeSlot: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
      default: "morning",
    },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Inquiry = mongoose.model<IInquiry>("Inquiry", InquirySchema);
