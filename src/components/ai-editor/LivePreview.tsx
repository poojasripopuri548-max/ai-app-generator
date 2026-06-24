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

const viewportDimensions: Record<
  ViewportSize,
  { width: number; label: string }
> = {
  mobile: { width: 375, label: "Mobile" },
  tablet: { width: 768, label: "Tablet" },
  desktop: { width: 1280, label: "Desktop" },
};

const DEFAULT_CODE = `export default function Preview() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1>AI App Generator</h1>
    </div>
  );
}`;

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPreviewPage(sourceCode: string): string {
  const safe = escapeHTML(sourceCode);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<style>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

body{
  background:#0f172a;
  color:#e2e8f0;
  font-family:monospace;
}

pre{
  padding:24px;
  white-space:pre-wrap;
  word-break:break-word;
  min-height:100vh;
  overflow:auto;
  line-height:1.5;
}
</style>
</head>

<body>
<pre>${safe}</pre>
</body>
</html>
`;
}

export default function LivePreview({ code }: LivePreviewProps) {
  const [viewSize, setViewSize] = useState<ViewportSize>("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIframeKey((prev) => prev + 1);
  }, [code]);

  const currentCode = code || DEFAULT_CODE;
  const htmlContent = buildPreviewPage(currentCode);
  const dimensions = viewportDimensions[viewSize];

  return (
    <div
      className={`flex flex-col bg-slate-950 ${
        isFullscreen ? "fixed inset-0 z-50" : "h-full"
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Preview
          </span>

          {code && (
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">
              Updated
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {(["desktop", "tablet", "mobile"] as ViewportSize[]).map(
            (size) => (
              <button
                key={size}
                onClick={() => setViewSize(size)}
                className={`p-1.5 rounded-lg transition ${
                  viewSize === size
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                }`}
              >
                {size === "mobile" ? (
                  <Smartphone className="h-4 w-4" />
                ) : size === "tablet" ? (
                  <Tablet className="h-4 w-4" />
                ) : (
                  <Monitor className="h-4 w-4" />
                )}
              </button>
            )
          )}

          <div className="w-px h-5 bg-slate-800 mx-2" />

          <button
            onClick={() => setIframeKey((prev) => prev + 1)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-start justify-center overflow-auto bg-slate-950 p-4">
        <div
          className="overflow-hidden rounded-lg bg-white shadow-2xl"
          style={{
            width: dimensions.width,
            maxWidth: "100%",
            height: "100%",
            minHeight: "500px",
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