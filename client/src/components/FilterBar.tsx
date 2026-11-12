import React from "react";
import { Home, Building2, Store, Search, MapPin } from "lucide-react";
import { DhakaArea } from "../types";

interface FilterBarProps {
  category: string;
  setCategory: (cat: string) => void;
  area: string;
  setArea: (area: string) => void;
  maxRent: number;
  setMaxRent: (rent: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  totalCount: number;
}

const DHAKA_AREAS: DhakaArea[] = [
  "Gulshan",
  "Banani",
  "Dhanmondi",
  "Mirpur",
  "Uttara",
  "Motijheel",
];

export const FilterBar: React.FC<FilterBarProps> = ({
  category,
  setCategory,
  area,
  setArea,
  maxRent,
  setMaxRent,
  searchQuery,
  setSearchQuery,
  totalCount,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-5 pb-5 border-b border-gray-100">
        <button
          onClick={() => setCategory("all")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            category === "all"
              ? "bg-green-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <span>All Properties</span>
        </button>
        <button
          onClick={() => setCategory("home")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            category === "home"
              ? "bg-green-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home / Apartment</span>
        </button>
        <button
          onClick={() => setCategory("office")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            category === "office"
              ? "bg-green-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Commercial Office</span>
        </button>
        <button
          onClick={() => setCategory("shop")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            category === "shop"
              ? "bg-green-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Retail Shop</span>
        </button>
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Keyword Search */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keywords, roads, amenities..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Dhaka Neighborhood Select */}
        <div className="md:col-span-4 relative">
          <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
          >
            <option value="all">All Dhaka Neighborhoods</option>
            {DHAKA_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Max Rent Slider */}
        <div className="md:col-span-3 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center text-xs font-medium text-gray-700 mb-1">
            <span>Max Budget:</span>
            <span className="font-bold text-green-700">
              {maxRent >= 300000 ? "Any Budget" : `৳ ${maxRent.toLocaleString()}`}
            </span>
          </div>
          <input
            type="range"
            min={15000}
            max={300000}
            step={5000}
            value={maxRent}
            onChange={(e) => setMaxRent(Number(e.target.value))}
            className="w-full accent-green-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Results badge */}
      <div className="mt-3 text-xs text-gray-500 flex justify-between items-center">
        <span>
          Showing <strong className="text-gray-800">{totalCount}</strong> verified rentals
        </span>
        {(category !== "all" || area !== "all" || searchQuery || maxRent < 300000) && (
          <button
            onClick={() => {
              setCategory("all");
              setArea("all");
              setSearchQuery("");
              setMaxRent(300000);
            }}
            className="text-green-600 hover:text-green-700 font-semibold text-xs"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
