import React from "react";
import { Home, Building2, Store, Search, MapPin, ArrowUpDown, Maximize2 } from "lucide-react";
import { DhakaArea } from "../types";

export type SortOption = "newest" | "rent_asc" | "rent_desc" | "sqft_desc";

interface FilterBarProps {
  category: string;
  setCategory: (cat: string) => void;
  area: string;
  setArea: (area: string) => void;
  maxRent: number;
  setMaxRent: (rent: number) => void;
  minSqft: number;
  setMinSqft: (sqft: number) => void;
  sort: SortOption;
  setSort: (sort: SortOption) => void;
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
  minSqft,
  setMinSqft,
  sort,
  setSort,
  searchQuery,
  setSearchQuery,
  totalCount,
}) => {
  const hasActiveFilters =
    category !== "all" ||
    area !== "all" ||
    searchQuery.trim() !== "" ||
    maxRent < 300000 ||
    minSqft > 0 ||
    sort !== "newest";
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-5 pb-5 border-b border-gray-100">
        <button
          onClick={() => setCategory("all")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            category === "all"
              ? "bg-green-700 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <span>All Properties</span>
        </button>
        <button
          onClick={() => setCategory("home")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
            category === "home"
              ? "bg-green-700 text-white shadow-sm"
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
              ? "bg-green-700 text-white shadow-sm"
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
              ? "bg-green-700 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Retail Shop</span>
        </button>
      </div>

      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Keyword Search */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="filter-search"
            type="text"
            aria-label="Search listings by keywords, roads, or amenities"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keywords, roads, amenities..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Dhaka Neighborhood Select */}
        <div className="md:col-span-3 relative">
          <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            id="filter-area"
            aria-label="Filter by Dhaka neighborhood"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
          >
            <option value="all">All Neighborhoods</option>
            {DHAKA_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Min Size (sqft) */}
        <div className="md:col-span-2 relative">
          <Maximize2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            id="filter-min-sqft"
            aria-label="Minimum property size in square feet"
            value={minSqft}
            onChange={(e) => setMinSqft(Number(e.target.value))}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
          >
            <option value={0}>Any Size</option>
            <option value={500}>500+ sqft</option>
            <option value={1000}>1,000+ sqft</option>
            <option value={1500}>1,500+ sqft</option>
            <option value={2000}>2,000+ sqft</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="md:col-span-3 relative">
          <ArrowUpDown className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            id="filter-sort"
            aria-label="Sort listings"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="w-full pl-10 pr-6 py-2.5 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
          >
            <option value="newest">Newest First</option>
            <option value="rent_asc">Rent: Low to High</option>
            <option value="rent_desc">Rent: High to Low</option>
            <option value="sqft_desc">Size: Largest First</option>
          </select>
        </div>
      </div>

      {/* Budget Slider + Results Row */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 sm:w-80">
          <label htmlFor="filter-max-rent" className="text-xs font-medium text-gray-700 whitespace-nowrap">
            Max Budget:
          </label>
          <input
            id="filter-max-rent"
            type="range"
            aria-label="Maximum monthly rent budget in BDT"
            min={15000}
            max={300000}
            step={5000}
            value={maxRent}
            onChange={(e) => setMaxRent(Number(e.target.value))}
            className="w-full accent-green-700 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-bold text-green-700 whitespace-nowrap">
            {maxRent >= 300000 ? "Any" : `৳${maxRent.toLocaleString()}`}
          </span>
        </div>

        <div className="text-xs text-gray-500 flex items-center justify-between sm:justify-end gap-4">
          <span>
            Showing <strong className="text-gray-800">{totalCount}</strong> verified rentals
          </span>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setCategory("all");
                setArea("all");
                setSearchQuery("");
                setMaxRent(300000);
                setMinSqft(0);
                setSort("newest");
              }}
              className="text-green-600 hover:text-green-700 font-semibold text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
