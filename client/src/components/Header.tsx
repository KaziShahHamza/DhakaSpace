import React from "react";
import { Building2, PlusCircle, Sparkles, UserCheck, Shield } from "lucide-react";

interface HeaderProps {
  role: "renter" | "landlord";
  onRoleChange: (newRole: "renter" | "landlord") => void;
  onOpenPostModal: () => void;
  onOpenConcierge: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  onRoleChange,
  onOpenPostModal,
  onOpenConcierge,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-green-600 to-emerald-500 text-white p-2.5 rounded-xl shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Dhaka<span className="text-green-600">Space</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-full">
                Dhaka City
              </span>
            </div>
            <p className="text-xs text-gray-500 hidden md:block">
              Home • Office • Shop Rentals across Dhaka
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* AI Concierge quick trigger */}
          <button
            onClick={onOpenConcierge}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition shadow-sm"
            title="Ask Dhaka Rental Concierge"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline">AI Concierge</span>
          </button>

          {/* Renter vs Landlord Switcher */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center text-xs font-medium border border-gray-200">
            <button
              onClick={() => onRoleChange("renter")}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition ${
                role === "renter"
                  ? "bg-white text-gray-900 shadow-sm font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Renter</span>
            </button>
            <button
              onClick={() => onRoleChange("landlord")}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition ${
                role === "landlord"
                  ? "bg-green-600 text-white shadow-sm font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Landlord</span>
            </button>
          </div>

          {/* Landlord Post Listing button */}
          {role === "landlord" && (
            <button
              onClick={onOpenPostModal}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Listing</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
