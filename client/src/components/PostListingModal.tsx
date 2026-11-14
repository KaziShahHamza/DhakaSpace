import React, { useState } from "react";
import { X, Sparkles, CheckCircle2 } from "lucide-react";
import { ListingCategory, DhakaArea } from "../types";

interface PostListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated: () => void;
}

const DHAKA_AREAS: DhakaArea[] = [
  "Gulshan",
  "Banani",
  "Dhanmondi",
  "Mirpur",
  "Uttara",
  "Motijheel",
];

export const PostListingModal: React.FC<PostListingModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
}) => {
  const [category, setCategory] = useState<ListingCategory>("home");
  const [area, setArea] = useState<DhakaArea>("Gulshan");
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [rentBdt, setRentBdt] = useState<number>(35000);
  const [advanceMonths, setAdvanceMonths] = useState<number>(2);
  const [sizeSqft, setSizeSqft] = useState<number>(1200);
  const [bedrooms, setBedrooms] = useState<number | undefined>(3);
  const [floor, setFloor] = useState("3rd Floor");
  const [amenitiesInput, setAmenitiesInput] = useState("Lift, Generator Backup, 24/7 Security");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("Property Owner");
  const [contactPhone, setContactPhone] = useState("+8801700000000");

  // AI Autofill state
  const [aiNotes, setAiNotes] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAiAutofill = async () => {
    if (!aiNotes.trim()) return;
    setIsAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch("/api/ai/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: aiNotes }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "AI autofill service currently unavailable");
      }

      if (data.data) {
        const item = data.data;
        if (item.category) setCategory(item.category);
        if (item.area) setArea(item.area);
        if (item.title) setTitle(item.title);
        if (item.address) setAddress(item.address);
        if (item.rentBdt) setRentBdt(item.rentBdt);
        if (item.advanceMonths) setAdvanceMonths(item.advanceMonths);
        if (item.sizeSqft) setSizeSqft(item.sizeSqft);
        if (item.bedrooms) setBedrooms(item.bedrooms);
        if (item.floor) setFloor(item.floor);
        if (Array.isArray(item.amenities)) {
          setAmenitiesInput(item.amenities.join(", "));
        }
        if (item.description) setDescription(item.description);
        if (item.contactName) setContactName(item.contactName);
        if (item.contactPhone) setContactPhone(item.contactPhone);
      }
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "AI autofill request failed");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const amenities = amenitiesInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title,
        category,
        area,
        address,
        rentBdt: Number(rentBdt),
        advanceMonths: Number(advanceMonths),
        sizeSqft: Number(sizeSqft),
        bedrooms: category === "home" && bedrooms ? Number(bedrooms) : undefined,
        floor,
        amenities,
        description,
        contactName,
        contactPhone,
      };

      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg =
          data.message ||
          (data.errors &&
            data.errors
              .map((e: { path?: string[]; message: string }) =>
                `${e.path?.join(".") || "field"}: ${e.message}`
              )
              .join(", ")) ||
          "Failed to create listing";
        throw new Error(errMsg);
      }

      setIsSuccess(true);
      onListingCreated();
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error creating listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Post a New Dhaka Listing
            </h2>
            <p className="text-xs text-gray-500">
              Reach verified Dhaka renters for Home, Office, or Retail Shop
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        {isSuccess ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Dhaka Listing Published Successfully!
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Your property is now live in the DhakaSpace catalog and available for verified renters.
            </p>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto space-y-6">
          {/* AI Autofill Assistant Box */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl p-4">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>Smart AI Autofill (Powered by Google GenAI SDK)</span>
            </div>
            <p className="text-xs text-emerald-700/80 mb-3">
              Paste your rough notes or Bangla-English shorthand and let Gemini extract the details into the form below!
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={aiNotes}
                onChange={(e) => setAiNotes(e.target.value)}
                placeholder="e.g. 1500 sqft 3rd floor office in Banani road 11, lift, full generator, 90k rent"
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAiAutofill}
                disabled={isAiLoading || !aiNotes.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1 flex-shrink-0"
              >
                {isAiLoading ? <span>Processing...</span> : <span>Autofill Form</span>}
              </button>
            </div>
            {aiError && (
              <p className="text-[11px] text-red-600 mt-2 font-medium">
                {aiError}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category & Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Property Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ListingCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="home">Home / Apartment</option>
                  <option value="office">Commercial Office</option>
                  <option value="shop">Retail Shop</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Dhaka Neighborhood
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as DhakaArea)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  {DHAKA_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Listing Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Spacious 3-Bed Apartment with Balcony in Banani"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Detailed Dhaka Address
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. House 45, Road 11, Block D, Banani"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            {/* Pricing & Size */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Monthly Rent (৳ BDT)
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={rentBdt}
                  onChange={(e) => setRentBdt(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Size (sqft)
                </label>
                <input
                  type="number"
                  required
                  min={50}
                  value={sizeSqft}
                  onChange={(e) => setSizeSqft(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Advance (Months)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={advanceMonths}
                  onChange={(e) => setAdvanceMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Floor and Bedrooms */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Floor Level
                </label>
                <input
                  type="text"
                  required
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="e.g. 4th Floor"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              {category === "home" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={bedrooms || 3}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Amenities (comma separated)
              </label>
              <input
                type="text"
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
                placeholder="Lift, Full Generator Backup, Parking, CCTV"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Property Description
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention natural lighting, security, utility status (gas line), and nearby landmarks..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Landlord / Agent Name"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Contact Phone (+880)
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+88017XXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow transition"
              >
                {isSubmitting ? "Publishing..." : "Publish Dhaka Listing"}
              </button>
            </div>
          </form>
        </div>
        )}
      </div>
    </div>
  );
};
