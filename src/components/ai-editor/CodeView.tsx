"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Download, Code2, Eye, FileCode } from "lucide-react";
import { downloadProjectAsZip, createExportFiles } from "@/lib/export-utils";

interface CodeViewProps {
  code: string;
  projectName: string;
}

export default function CodeView({ code, projectName }: CodeViewProps) {
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  const handleExport = useCallback(async () => {
    if (!code) return;
    setExporting(true);
    try {
      const files = createExportFiles(code);
      await downloadProjectAsZip(projectName || "ai-generated-app", files);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [code, projectName]);

  // Determine language for display
  const language = code.includes("import") && code.includes("from") ? "TSX" : code.includes("def ") ? "Python" : code.includes("function") ? "JavaScript" : "Code";

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
                viewMode === "preview"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
                viewMode === "code"
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Code
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {code && (
            <>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs font-mono rounded">
                {language}
              </span>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-xs rounded">
                {code.split("\n").length} lines
              </span>
            </>
          )}

          <div className="w-px h-5 bg-slate-800 mx-2" />

          <button
            onClick={handleCopy}
            disabled={!code}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition disabled:opacity-50"
            title="Copy code"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={handleExport}
            disabled={!code || exporting}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition disabled:opacity-50"
            title="Download as ZIP"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {!code ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="p-3 bg-slate-800 rounded-xl mb-4">
              <FileCode className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-slate-300 font-medium text-sm">No code generated yet</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-xs">
              Ask the AI to build something and the generated code will appear here.
            </p>
          </div>
        ) : viewMode === "code" ? (
          <pre className="p-4 text-sm font-mono text-slate-200 leading-relaxed whitespace-pre-wrap overflow-x-auto">
            <code>{code}</code>
          </pre>
        ) : (
          <div className="p-4">
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-slate-500 ml-2">Generated Code Preview</span>
              </div>
              <pre className="text-sm font-mono text-slate-200 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                <code>{code}</code>
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      {code && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-900">
          <p className="text-xs text-slate-500">
            Generated code ready for export
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
          >
            {exporting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                Export ZIP
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}