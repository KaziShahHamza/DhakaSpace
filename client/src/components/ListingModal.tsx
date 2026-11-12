import React from "react";
import {
  X,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Listing } from "../types";

interface ListingModalProps {
  listing: Listing | null;
  onClose: () => void;
  onRequestVisit: (listing: Listing) => void;
}

export const ListingModal: React.FC<ListingModalProps> = ({
  listing,
  onClose,
  onRequestVisit,
}) => {
  if (!listing) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-green-50 text-green-700 border border-green-200">
              {listing.category}
            </span>
            <span className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{listing.area}, Dhaka</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{listing.title}</h2>
          <p className="text-xs text-gray-500 mt-1">{listing.address}</p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Price & Primary Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
            <div>
              <p className="text-xs text-gray-500">Monthly Rent</p>
              <p className="text-lg font-extrabold text-green-700">
                ৳ {listing.rentBdt.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Advance Deposit</p>
              <p className="text-lg font-bold text-gray-800">
                {listing.advanceMonths} Months
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Floor Area</p>
              <p className="text-lg font-bold text-gray-800">
                {listing.sizeSqft} sqft
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Floor Level</p>
              <p className="text-lg font-bold text-gray-800">{listing.floor}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Property Overview
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Features & Amenities
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {listing.amenities.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-xs text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Landlord Contact Box */}
          <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-emerald-800 font-semibold">
                  Property Contact
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {listing.contactName}
                </p>
              </div>
            </div>
            <a
              href={`tel:${listing.contactPhone}`}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 rounded-lg shadow-sm hover:bg-emerald-50 transition"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{listing.contactPhone}</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onRequestVisit(listing);
            }}
            className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow transition"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Property Visit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
