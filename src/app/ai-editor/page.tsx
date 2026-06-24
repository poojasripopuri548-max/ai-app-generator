"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Maximize2, Minimize2 } from "lucide-react";
import ChatPanel from "@/components/ai-editor/ChatPanel";
import LivePreview from "@/components/ai-editor/LivePreview";
import CodeView from "@/components/ai-editor/CodeView";
import ProjectManager from "@/components/ai-editor/ProjectManager";
import { AIProject, getProject } from "@/lib/project-storage";

type ViewMode = "preview" | "code";
type TabMode = "chat" | "code";

export default function AIEditorPage() {
  const router = useRouter();
  const [generatedCode, setGeneratedCode] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [activeTab, setActiveTab] = useState<TabMode>("chat");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("AI Generated App");

  const handleCodeGenerated = useCallback((code: string) => {
    setGeneratedCode(code);
    // Auto-switch to preview when code is generated
    setViewMode("preview");
  }, []);

  const handleLoadProject = useCallback((project: AIProject) => {
    setGeneratedCode(project.code);
    setProjectName(project.name);
    setActiveProjectId(project.id);
    setViewMode("preview");
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
            title="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-500/10 rounded-lg">
              <Sparkles className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-100">
                AI App Generator
              </h1>
              <p className="text-xs text-slate-500 -mt-0.5">
                {projectName}
              </p>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-800 mx-2" />

          <ProjectManager
            currentCode={generatedCode}
            onLoadProject={handleLoadProject}
            activeProjectId={activeProjectId}
            onSetActiveProject={setActiveProjectId}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center gap-0.5 bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                viewMode === "preview"
                  ? "bg-blue-500/20 text-blue-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                viewMode === "code"
                  ? "bg-blue-500/20 text-blue-400 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Code
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat + Code View */}
        <div className="w-[420px] min-w-[320px] max-w-[500px] border-r border-slate-800 flex flex-col bg-slate-900">
          {/* Tab switcher for left panel */}
          <div className="flex items-center border-b border-slate-800">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 px-4 py-2 text-xs font-medium transition ${
                activeTab === "chat"
                  ? "text-blue-400 border-b-2 border-blue-500 bg-slate-800/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`flex-1 px-4 py-2 text-xs font-medium transition ${
                activeTab === "code"
                  ? "text-blue-400 border-b-2 border-blue-500 bg-slate-800/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Code View
            </button>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "chat" ? (
              <ChatPanel onCodeGenerated={handleCodeGenerated} />
            ) : (
              <CodeView code={generatedCode} projectName={projectName} />
            )}
          </div>
        </div>

        {/* Right Panel - Preview matches the view mode */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {viewMode === "preview" ? (
            <LivePreview code={generatedCode} />
          ) : (
            <div className="flex-1 overflow-auto bg-slate-950">
              <CodeView code={generatedCode} projectName={projectName} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}