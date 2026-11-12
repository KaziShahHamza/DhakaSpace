import React from "react";
import {
  Building2,
  Home,
  Store,
  MapPin,
  Maximize2,
  Layers,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Listing } from "../types";

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  onRequestVisit: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelect,
  onRequestVisit,
}) => {
  const getCategoryIcon = () => {
    switch (listing.category) {
      case "home":
        return <Home className="w-4 h-4 text-emerald-600" />;
      case "office":
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case "shop":
        return <Store className="w-4 h-4 text-amber-600" />;
    }
  };

  const getCategoryBadgeClass = () => {
    switch (listing.category) {
      case "home":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "office":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "shop":
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const bdtPerSqft = Math.round(listing.rentBdt / listing.sizeSqft);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg border ${getCategoryBadgeClass()}`}
          >
            {getCategoryIcon()}
            <span className="capitalize">{listing.category}</span>
          </span>
          <span className="inline-flex items-center space-x-1 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>{listing.area}</span>
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(listing)}
          className="text-base font-bold text-gray-900 group-hover:text-green-600 cursor-pointer transition line-clamp-2 mb-2"
        >
          {listing.title}
        </h3>

        {/* Address */}
        <p className="text-xs text-gray-500 mb-4 line-clamp-1">
          {listing.address}
        </p>

        {/* Price & Metrics Bar */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-xl font-extrabold text-green-700">
                ৳ {listing.rentBdt.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500 ml-1">/ month</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-gray-500">
                ~৳{bdtPerSqft}/sqft
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs text-gray-600">
            <span className="flex items-center space-x-1">
              <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
              <span>{listing.sizeSqft} sqft</span>
            </span>
            <span className="flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              <span>{listing.floor}</span>
            </span>
            {listing.bedrooms && (
              <span className="font-medium text-gray-700">
                {listing.bedrooms} Beds
              </span>
            )}
          </div>
        </div>

        {/* Amenities Highlights */}
        {listing.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {listing.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md"
              >
                <CheckCircle2 className="w-3 h-3 text-green-600 mr-1" />
                {amenity}
              </span>
            ))}
            {listing.amenities.length > 3 && (
              <span className="text-[11px] text-gray-400 self-center">
                +{listing.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={() => onSelect(listing)}
          className="text-xs font-semibold text-gray-700 hover:text-green-700 transition"
        >
          View Details
        </button>
        <button
          onClick={() => onRequestVisit(listing)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Request Visit</span>
        </button>
      </div>
    </div>
  );
};
