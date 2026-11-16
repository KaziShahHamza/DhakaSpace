import React from "react";
import { X, Scale, MapPin, CheckCircle2, Trash2 } from "lucide-react";
import { Listing } from "../types";

interface CompareModalProps {
  listings: Listing[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
  onSelectListing: (listing: Listing) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  listings,
  isOpen,
  onClose,
  onRemove,
  onSelectListing,
}) => {
  if (!isOpen || listings.length === 0) return null;

  const lowestRent = Math.min(...listings.map((l) => l.rentBdt));
  const largestSqft = Math.max(...listings.map((l) => l.sizeSqft));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Compare Dhaka properties side by side"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-950 text-white">
          <div className="flex items-center space-x-2.5">
            <Scale className="w-5 h-5 text-emerald-300" />
            <div>
              <h2 className="text-base font-bold">Compare Properties</h2>
              <p className="text-xs text-emerald-200/80">
                Side-by-side Dhaka rental breakdown ({listings.length} selected)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close comparison modal"
            className="p-2 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-auto p-6">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-36 align-top">
                  Metric
                </th>
                {listings.map((item) => (
                  <th key={item._id} className="py-3 px-4 align-top min-w-[210px]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1.5">
                          {item.category}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                          {item.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => onRemove(item._id)}
                        title="Remove from comparison"
                        aria-label={`Remove ${item.title} from comparison`}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3.5 pr-4 text-xs font-semibold text-gray-500">Monthly Rent</td>
                {listings.map((item) => (
                  <td key={item._id} className="py-3.5 px-4">
                    <span className="text-base font-extrabold text-green-700">
                      ৳ {item.rentBdt.toLocaleString()}
                    </span>
                    {listings.length > 1 && item.rentBdt === lowestRent && (
                      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-800">
                        Lowest
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-xs font-semibold text-gray-500">Rate per sqft</td>
                {listings.map((item) => (
                  <td key={item._id} className="py-3.5 px-4 text-gray-700 font-medium">
                    ~৳{Math.round(item.rentBdt / item.sizeSqft).toLocaleString()}/sqft
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-xs font-semibold text-gray-500">Size</td>
                {listings.map((item) => (
                  <td key={item._id} className="py-3.5 px-4 text-gray-800 font-medium">
                    {item.sizeSqft.toLocaleString()} sqft
                    {listings.length > 1 && item.sizeSqft === largestSqft && (
                      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        Largest
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-xs font-semibold text-gray-500">Neighborhood</td>
                {listings.map((item) => (
                  <td key={item._id} className="py-3.5 px-4 text-gray-700">
                    <div className="flex items-center space-x-1 font-semibold text-gray-800">
                      <MapPin className="w-3.5 h-3.5 text-green-600" />
                      <span>{item.area}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{item.address}</p>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-xs font-semibold text-gray-500">Floor / Beds</td>
                {listings.map((item) => (
                  <td key={item._id} className="py-3.5 px-4 text-gray-700">
                    {item.floor}
                    {item.bedrooms ? ` · ${item.bedrooms} Beds` : ""}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-xs font-semibold text-gray-500">Advance Deposit</td>
                {listings.map((item) => (
                  <td key={item._id} className="py-3.5 px-4 text-gray-700">
                    <span className="font-semibold">{item.advanceMonths} months</span>
                    <span className="block text-xs text-gray-500">
                      ৳ {(item.rentBdt * item.advanceMonths).toLocaleString()}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-xs font-semibold text-gray-500 align-top">Amenities</td>
                {listings.map((item) => (
                  <td key={item._id} className="py-3.5 px-4 align-top">
                    <ul className="space-y-1">
                      {item.amenities.map((amenity, idx) => (
                        <li key={idx} className="flex items-start text-xs text-gray-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mr-1.5 mt-0.5 shrink-0" />
                          <span>{amenity}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 pr-4" />
                {listings.map((item) => (
                  <td key={item._id} className="py-4 px-4">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectListing(item);
                      }}
                      className="w-full py-2 px-3 text-xs font-semibold text-white bg-green-700 hover:bg-green-800 rounded-xl transition"
                    >
                      View Full Details
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
