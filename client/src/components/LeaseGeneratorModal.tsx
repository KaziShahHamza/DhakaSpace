import React, { useState } from "react";
import { X, FileText, Copy, Check, Printer, RefreshCw, ShieldCheck } from "lucide-react";
import { Listing } from "../types";
import { apiUrl } from "../lib/api";

interface LeaseClause {
  heading: string;
  body: string;
}

interface GeneratedLease {
  title: string;
  governingLaw: string;
  stampRequirement: string;
  summary: {
    propertyType: string;
    location: string;
    sizeSqft: number;
    monthlyRentBdt: number;
    advanceDepositBdt: number;
    advanceMonths: number;
    termMonths: number;
    noticeMonths: number;
    landlordName: string;
    tenantName: string;
  };
  clauses: LeaseClause[];
  complianceNotes: string[];
  holdingTaxNote: string;
  disclaimer: string;
}

interface LeaseGeneratorModalProps {
  listing: Listing | null;
  onClose: () => void;
}

export const LeaseGeneratorModal: React.FC<LeaseGeneratorModalProps> = ({
  listing,
  onClose,
}) => {
  const [landlordName, setLandlordName] = useState(listing?.contactName || "");
  const [tenantName, setTenantName] = useState("");
  const [advanceMonths, setAdvanceMonths] = useState(listing?.advanceMonths ?? 2);
  const [noticeMonths, setNoticeMonths] = useState(2);
  const [termMonths, setTermMonths] = useState(11);
  const [lease, setLease] = useState<GeneratedLease | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!listing) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/ai/generate-lease"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area: listing.area,
          category: listing.category,
          sizeSqft: listing.sizeSqft,
          rentBdt: listing.rentBdt,
          advanceMonths: Number(advanceMonths),
          address: listing.address,
          landlordName: landlordName.trim() || undefined,
          tenantName: tenantName.trim() || undefined,
          noticeMonths: Number(noticeMonths),
          termMonths: Number(termMonths),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate lease");
      setLease(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error generating tenancy deed");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPlainText = (data: GeneratedLease) => {
    const lines = [
      data.title,
      `Governing Law: ${data.governingLaw}`,
      `Stamp Duty: ${data.stampRequirement}`,
      "",
      `Location: ${data.summary.location}`,
      `Size: ${data.summary.sizeSqft} sqft | Category: ${data.summary.propertyType}`,
      `Monthly Rent: ৳ ${data.summary.monthlyRentBdt.toLocaleString()}`,
      `Security Advance: ৳ ${data.summary.advanceDepositBdt.toLocaleString()} (${data.summary.advanceMonths} months)`,
      `Term: ${data.summary.termMonths} months | Notice: ${data.summary.noticeMonths} months`,
      `Landlord: ${data.summary.landlordName}`,
      `Tenant: ${data.summary.tenantName}`,
      "",
      ...data.clauses.flatMap((c) => [c.heading, c.body, ""]),
      "Compliance Notes:",
      ...data.complianceNotes.map((n) => `- ${n}`),
      "",
      data.holdingTaxNote,
      "",
      data.disclaimer,
    ];
    return lines.join("\n");
  };

  const handleCopy = async () => {
    if (!lease) return;
    await navigator.clipboard.writeText(formatPlainText(lease));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const escapeHtml = (value: string | number): string =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const handlePrint = () => {
    if (!lease) return;
    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;
    const html = `<!doctype html><html><head><title>${escapeHtml(lease.title)}</title>
      <style>body{font-family:system-ui,sans-serif;padding:32px;line-height:1.5;color:#111}
      h1{font-size:20px;margin-bottom:4px}h2{font-size:14px;margin-top:16px;margin-bottom:4px}
      .meta{font-size:12px;color:#444;margin-bottom:16px}.box{background:#f8fafc;border:1px solid #e2e8f0;padding:12px;border-radius:8px;font-size:13px}
      .disclaimer{margin-top:24px;font-size:11px;color:#555;border-top:1px solid #ddd;padding-top:10px}</style></head>
      <body><h1>${escapeHtml(lease.title)}</h1>
      <div class="meta"><strong>Governing Law:</strong> ${escapeHtml(lease.governingLaw)}<br/><strong>Stamp:</strong> ${escapeHtml(lease.stampRequirement)}</div>
      <div class="box"><strong>Location:</strong> ${escapeHtml(lease.summary.location)} (${escapeHtml(lease.summary.sizeSqft)} sqft)<br/>
      <strong>Rent:</strong> ৳ ${escapeHtml(lease.summary.monthlyRentBdt.toLocaleString())}/month | <strong>Advance:</strong> ৳ ${escapeHtml(lease.summary.advanceDepositBdt.toLocaleString())} (${escapeHtml(lease.summary.advanceMonths)} months)<br/>
      <strong>Landlord:</strong> ${escapeHtml(lease.summary.landlordName)} | <strong>Tenant:</strong> ${escapeHtml(lease.summary.tenantName)}</div>
      ${lease.clauses.map((c) => `<h2>${escapeHtml(c.heading)}</h2><p>${escapeHtml(c.body)}</p>`).join("")}
      <h2>Statutory Compliance</h2><ul>${lease.complianceNotes.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}</ul>
      <p><strong>${escapeHtml(lease.holdingTaxNote)}</strong></p>
      <div class="disclaimer">${escapeHtml(lease.disclaimer)}</div></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Bangladesh Tenancy Deed Generator
              </h2>
              <p className="text-xs text-gray-500">
                {listing.area}, Dhaka • {listing.sizeSqft} sqft • ৳{listing.rentBdt.toLocaleString()}/mo
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
          <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Landlord Name
              </label>
              <input
                type="text"
                value={landlordName}
                onChange={(e) => setLandlordName(e.target.value)}
                placeholder="First Party (Landlord)"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tenant Name
              </label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Second Party (Tenant)"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Advance (Months)
                </label>
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={advanceMonths}
                  onChange={(e) => setAdvanceMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Notice (Months)
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={noticeMonths}
                  onChange={(e) => setNoticeMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Term (Months)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={termMonths}
                  onChange={(e) => setTermMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition disabled:opacity-60"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span>{isLoading ? "Drafting Deed..." : "Generate Compliant Deed"}</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {lease && (
            <div className="space-y-4 border border-gray-200 rounded-xl p-4 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{lease.title}</h3>
                  <p className="text-[11px] text-emerald-700 font-medium">{lease.governingLaw}</p>
                  <p className="text-[11px] text-gray-500">{lease.stampRequirement}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {lease.clauses.map((clause, idx) => (
                  <div key={idx} className="text-xs">
                    <h4 className="font-bold text-gray-800 mb-0.5">{clause.heading}</h4>
                    <p className="text-gray-600 leading-relaxed">{clause.body}</p>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Dhaka Statutory & Municipal Compliance</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-amber-900/90 space-y-1">
                  {lease.complianceNotes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-amber-800 font-medium pt-1">
                  {lease.holdingTaxNote}
                </p>
              </div>

              <p className="text-[11px] text-gray-500 italic border-t border-gray-100 pt-2">
                {lease.disclaimer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
