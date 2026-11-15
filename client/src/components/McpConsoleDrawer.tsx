import React, { useEffect, useState } from "react";
import { X, Terminal, Server, Wrench, RefreshCw } from "lucide-react";

interface McpToolInfo {
  name: string;
  description: string;
  parameters: string[];
}

interface McpServerStatus {
  name: string;
  plugin: string;
  transport: "stdio" | "http";
  commandSummary: string;
  status: "configured" | "env-placeholder";
  tools: McpToolInfo[];
}

interface McpStatusPayload {
  serverCount: number;
  totalTools: number;
  servers: McpServerStatus[];
}

interface McpConsoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const McpConsoleDrawer: React.FC<McpConsoleDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [statusData, setStatusData] = useState<McpStatusPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mcp/status");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load MCP status");
      setStatusData(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading MCP console");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-gray-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold">MCP Server Console</h2>
              <p className="text-[11px] text-slate-300">
                {statusData
                  ? `${statusData.serverCount} servers • ${statusData.totalTools} tools`
                  : "Registered Workspace MCPs"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={loadStatus}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition"
              title="Refresh MCP status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {statusData?.servers.map((srv) => (
            <div
              key={srv.name}
              className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-900">{srv.name}</span>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    srv.status === "configured"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {srv.status === "configured" ? "Ready" : "Env Placeholder"}
                </span>
              </div>

              <div className="text-[11px] text-gray-500 font-mono bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 truncate">
                [{srv.transport}] {srv.commandSummary}
              </div>

              {srv.tools.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <Wrench className="w-3 h-3" />
                    <span>Tools ({srv.tools.length})</span>
                  </div>
                  {srv.tools.map((tool) => (
                    <div
                      key={tool.name}
                      className="text-[11px] bg-slate-50 border border-slate-200/70 rounded-lg p-2"
                    >
                      <p className="font-mono font-semibold text-slate-800">{tool.name}</p>
                      <p className="text-slate-600 text-[10px] mt-0.5">{tool.description}</p>
                      {tool.parameters.length > 0 && (
                        <p className="text-[10px] text-emerald-700 font-mono mt-1">
                          params: {tool.parameters.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
