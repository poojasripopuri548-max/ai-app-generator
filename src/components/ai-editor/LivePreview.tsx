"use client";

import { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  Maximize2,
  Minimize2,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";

interface LivePreviewProps {
  code: string;
}

type ViewportSize = "mobile" | "tablet" | "desktop";

const viewportDimensions: Record<ViewportSize, { width: number; label: string }> = {
  mobile: { width: 375, label: "Mobile" },
  tablet: { width: 768, label: "Tablet" },
  desktop: { width: 1280, label: "Desktop" },
};

const DEFAULT_CODE = `export default function Preview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <div className="text-6xl mb-6">✨</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI App Generator
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Describe what you want to build in the chat.
        </p>
      </div>
    </div>
  );
}`;

function escapeHTML(str: string): string {
  const map: Record<string, string> = {
    "&": "&#38;",
    "<": "&#60;",
    ">": "&#62;",
    '"': "&#34;",
  };
  return str.replace(/[&<>"]/g, (ch) => map[ch]);
}

export default function LivePreview({ code }: LivePreviewProps) {
  const [viewSize, setViewSize] = useState<ViewportSize>("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (code) {
      setIframeKey((prev) => prev + 1);
    }
  }, [code]);

  function buildPreviewPage(sourceCode: string): string {
    const safe = escapeHTML(sourceCode);
    
    const lines = [
      "<!DOCTYPE html><html lang=en><head>",
      '<meta charset="UTF-8" />',
      '<meta name="viewport" content="width=device-width,initial-scale=1.0" />',
      '<script src="https://cdn.tailwindcss.com"></script>',
      "<style>",
      "*{margin:0;padding:0;box-sizing:border-box}",
      "body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif}",
      "</style></head><body>",
      '<div id=root>',
      '<div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-8">',
      '<div class="text-center max-w-2xl">',
      '<h1 class="text-4xl font-bold text-gray-900 mb-4">Live Preview</h1>',
      '<p class="text-xl text-gray-600 mb-8">Generated code appears here.</p>',
      "</div></div></div>",
      "<script>",
      "var r=document.getElementById('root');",
      "if(r){",
      "r.innerHTML='<pre style=\"padding:2rem;background:#1e293b;color:#e2e8f0;overflow:auto;min-height:100vh;font-family:monospace;font-size:.875rem;white-space:pre-wrap\">' + '",
      safe,
      "' + '</pre>'",
      "}",
      "</script></body></html>",
    ];

    return lines.join("\n");
  }

  const currentCode = code || DEFAULT_CODE;
  const htmlContent = buildPreviewPage(currentCode);
  const dimensions = viewportDimensions[viewSize];

  return (
    <div
      className={"flex flex-col bg-slate-950 " + (isFullscreen ? "fixed inset-0 z-50" : "h-full")}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Preview
          </span>
          {code && (
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full">
              Updated
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {(["desktop", "tablet", "mobile"] as ViewportSize[]).map((size) => (
            <button
              key={size}
              onClick={() => setViewSize(size)}
              className={
                "p-1.5 rounded-lg transition " +
                (viewSize === size
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800")
              }
              title={viewportDimensions[size].label}
            >
              {size === "mobile" ? (
                <Smartphone className="h-4 w-4" />
              ) : size === "tablet" ? (
                <Tablet className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
            </button>
          ))}

          <div className="w-px h-5 bg-slate-800 mx-2" />

          <button
            onClick={() => setIframeKey((prev) => prev + 1)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
            title="Refresh preview"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-start justify-center overflow-auto bg-slate-950 p-4">
        <div
          className="overflow-hidden rounded-lg bg-white shadow-2xl transition-all duration-300"
          style={{
            width: dimensions.width,
            maxWidth: "100%",
            height: "100%",
            minHeight: "400px",
          }}
        >
          <iframe
            key={iframeKey}
            ref={iframeRef}
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            title="Live Preview"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  );
}