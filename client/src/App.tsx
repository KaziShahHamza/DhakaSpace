import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { FilterBar } from "./components/FilterBar";
import { ListingCard } from "./components/ListingCard";
import { ListingModal } from "./components/ListingModal";
import { InquiryModal } from "./components/InquiryModal";
import { PostListingModal } from "./components/PostListingModal";
import { ConciergeDrawer } from "./components/ConciergeDrawer";
import { Listing, AreaStat } from "./types";
import { Building2, Sparkles, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";

export const App: React.FC = () => {
  const [role, setRole] = useState<"renter" | "landlord">("renter");
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState<AreaStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [category, setCategory] = useState<string>("all");
  const [area, setArea] = useState<string>("all");
  const [maxRent, setMaxRent] = useState<number>(300000);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [inquiryListing, setInquiryListing] = useState<Listing | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);

  const fetchListings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.append("category", category);
      if (area !== "all") params.append("area", area);
      if (maxRent < 300000) params.append("maxRent", maxRent.toString());
      if (searchQuery.trim()) params.append("q", searchQuery.trim());

      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load listings");
      setListings(data.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching listings");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/listings/stats");
      const data = await res.json();
      if (res.ok && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Failed to load Dhaka area stats:", err);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, area, maxRent, searchQuery]);

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        role={role}
        onRoleChange={setRole}
        onOpenPostModal={() => setIsPostModalOpen(true)}
        onOpenConcierge={() => setIsConciergeOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Dhaka Market Stats Hero Bar */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 skew-x-12 pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 mb-3">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              Live Dhaka Rental Market
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Find Your Ideal Space in Dhaka
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed mb-4">
              Explore homes, modern commercial offices, and prime retail storefronts in Gulshan, Banani, Dhanmondi, Mirpur, Uttara, and Motijheel with verified BDT pricing.
            </p>

            {/* Quick stats snapshot */}
            {stats.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {stats.slice(0, 4).map((stat, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10"
                  >
                    <strong className="text-emerald-300">{stat.area}</strong> ({stat.category}): ৳{stat.avgRent.toLocaleString()} avg
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          category={category}
          setCategory={setCategory}
          area={area}
          setArea={setArea}
          maxRent={maxRent}
          setMaxRent={setMaxRent}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalCount={listings.length}
        />

        {/* Listings Grid */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-green-600 animate-spin mx-auto" />
            <p className="text-sm font-medium text-gray-500">
              Loading Dhaka listings...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-center space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto text-red-500" />
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={fetchListings}
              className="text-xs text-red-800 underline font-medium"
            >
              Retry loading
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center space-y-3">
            <Building2 className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-gray-800">
              No matching listings found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try adjusting your category, neighborhood filter, or increasing your BDT budget slider.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <ListingCard
                key={item._id}
                listing={item}
                onSelect={(l) => setSelectedListing(l)}
                onRequestVisit={(l) => setInquiryListing(l)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating AI Concierge Trigger */}
      <button
        onClick={() => setIsConciergeOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition transform"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="text-xs font-bold">Ask AI Concierge</span>
      </button>

      {/* Modals */}
      <ListingModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onRequestVisit={(l) => setInquiryListing(l)}
      />

      <InquiryModal
        listing={inquiryListing}
        onClose={() => setInquiryListing(null)}
      />

      <PostListingModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onListingCreated={() => {
          fetchListings();
          fetchStats();
        }}
      />

      <ConciergeDrawer
        isOpen={isConciergeOpen}
        onClose={() => setIsConciergeOpen(false)}
      />
    </div>
  );
};
