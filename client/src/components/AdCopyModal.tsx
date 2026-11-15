import React, { useEffect, useState } from "react";
import { X, Megaphone, Copy, Check, RefreshCw } from "lucide-react";
import { Listing } from "../types";

interface GeneratedAdCopy {
  facebookPost: string;
  bikroyListing: {
    seoTitle: string;
    body: string;
  };
  banglaAd: string;
}

interface AdCopyModalProps {
  listing: Listing | null;
  onClose: () => void;
}

export const AdCopyModal: React.FC<AdCopyModalProps> = ({
  listing,
  onClose,
}) => {
  const [adCopy, setAdCopy] = useState<GeneratedAdCopy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!listing) return;
    let isCurrent = true;
    const controller = new AbortController();

    const load = async () => {
      setAdCopy(null);
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ai/generate-ad-copy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            title: listing.title,
            category: listing.category,
            area: listing.area,
            address: listing.address,
            rentBdt: listing.rentBdt,
            advanceMonths: listing.advanceMonths,
            sizeSqft: listing.sizeSqft,
            bedrooms: listing.bedrooms ?? null,
            floor: listing.floor,
            amenities: listing.amenities,
            contactPhone: listing.contactPhone,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to generate ad copy");
        if (isCurrent) setAdCopy(data.data);
      } catch (err: unknown) {
        if (isCurrent && !(err instanceof DOMException && err.name === "AbortError")) {
          setError(err instanceof Error ? err.message : "Error generating ad copy");
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    load();
    return () => {
      isCurrent = false;
      controller.abort();
    };
  }, [listing?._id]);

  if (!listing) return null;

  const copyText = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-indigo-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                AI Bilingual Social Ad Copy
              </h2>
              <p className="text-xs text-gray-500">
                {listing.title} • ৳{listing.rentBdt.toLocaleString()} • {listing.sizeSqft} sqft
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200/70 text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {isLoading && (
            <div className="py-12 text-center space-y-2">
              <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs font-medium text-gray-500">
                Crafting Facebook, Bikroy, and Bangla ad variants...
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {adCopy && (
            <div className="space-y-4">
              {/* Facebook */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                    Facebook To-Let Group (English)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText("fb", adCopy.facebookPost)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                  >
                    {copiedKey === "fb" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "fb" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {adCopy.facebookPost}
                </pre>
              </div>

              {/* Bikroy */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Bikroy / Classified SEO
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        "bikroy",
                        `${adCopy.bikroyListing.seoTitle}\n\n${adCopy.bikroyListing.body}`
                      )
                    }
                    className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                  >
                    {copiedKey === "bikroy" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "bikroy" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <p className="text-xs font-bold text-gray-900 mb-1.5">
                  {adCopy.bikroyListing.seoTitle}
                </p>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {adCopy.bikroyListing.body}
                </pre>
              </div>

              {/* Bangla */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                    Bangla Local / WhatsApp (বাংলা)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyText("bn", adCopy.banglaAd)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-100"
                  >
                    {copiedKey === "bn" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "bn" ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                  {adCopy.banglaAd}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
