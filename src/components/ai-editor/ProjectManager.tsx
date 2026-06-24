"use client";

import { useState, useEffect } from "react";
import {
  FolderPlus,
  FolderOpen,
  MoreHorizontal,
  Edit3,
  Trash2,
  Copy,
  FileCode,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  AIProject,
  loadProjects,
  createProject,
  updateProject,
  deleteProject,
  duplicateProject,
  renameProject,
} from "@/lib/project-storage";

interface ProjectManagerProps {
  currentCode: string;
  onLoadProject: (project: AIProject) => void;
  activeProjectId: string | null;
  onSetActiveProject: (id: string | null) => void;
}

export default function ProjectManager({
  currentCode,
  onLoadProject,
  activeProjectId,
  onSetActiveProject,
}: ProjectManagerProps) {
  const [projects, setProjects] = useState<AIProject[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  function refresh() {
    setProjects(loadProjects());
  }

 function handleCreate() {
  if (!currentCode.trim()) return;

  setIsCreating(true);

  setTimeout(() => {
    const project = createProject(
      `Project ${projects.length + 1}`,
      currentCode
    );

    if (!project) {
      alert("Failed to save project.");
      setIsCreating(false);
      return;
    }

    onSetActiveProject(project.id);
    refresh();
    setIsCreating(false);
  }, 300);
}

  function handleSave() {
    if (!activeProjectId || !currentCode.trim()) return;
    updateProject(activeProjectId, { code: currentCode });
    refresh();
  }

  function handleLoad(project: AIProject) {
    onLoadProject(project);
    onSetActiveProject(project.id);
    setIsOpen(false);
  }

  function handleDelete(id: string) {
    if (confirm("Delete this project?")) {
      deleteProject(id);
      if (activeProjectId === id) {
        onSetActiveProject(null);
      }
      refresh();
    }
  }

  function handleDuplicate(id: string) {
    duplicateProject(id);
    refresh();
    setMenuOpen(null);
  }

  function handleRename(id: string) {
    setEditingName(id);
    const project = projects.find((p) => p.id === id);
    setEditValue(project?.name || "");
    setMenuOpen(null);
  }

  function submitRename(id: string) {
    if (editValue.trim()) {
      renameProject(id, editValue.trim());
      refresh();
    }
    setEditingName(null);
  }

  const activeProject = projects.find((p) => p.id === activeProjectId);

  return (
    <div className="relative">
      {/* Project selector button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 transition"
      >
        <FolderOpen className="h-3.5 w-3.5" />
        {activeProject ? activeProject.name : "Projects"}
      </button>

      {/* Save button */}
      {activeProject && currentCode && (
        <button
          onClick={handleSave}
          className="ml-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium text-white transition"
        >
          Save
        </button>
      )}

      {/* Create new project */}
      {!activeProject && currentCode && (
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="ml-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-medium text-white transition disabled:opacity-50"
        >
          {isCreating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Save as Project"
          )}
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-1 w-72 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-50 max-h-96 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Saved Projects
              </span>
              <span className="text-xs text-slate-500">{projects.length}</span>
            </div>

            <div className="overflow-y-auto max-h-72">
              {projects.length === 0 ? (
                <div className="p-6 text-center">
                  <FolderPlus className="h-6 w-6 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs text-slate-500">No saved projects</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Generate code and save it as a project
                  </p>
                </div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className={`group flex items-center gap-3 px-3 py-2.5 hover:bg-slate-700/50 cursor-pointer transition ${
                      project.id === activeProjectId
                        ? "bg-blue-500/10 border-l-2 border-blue-500"
                        : ""
                    }`}
                    onClick={() => handleLoad(project)}
                  >
                    <FileCode className="h-4 w-4 text-slate-500 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      {editingName === project.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") submitRename(project.id);
                              if (e.key === "Escape") setEditingName(null);
                            }}
                            className="flex-1 bg-slate-700 text-xs text-slate-200 px-1.5 py-0.5 rounded outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              submitRename(project.id);
                            }}
                            className="p-0.5 text-emerald-400 hover:text-emerald-300"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingName(null);
                            }}
                            className="p-0.5 text-slate-500 hover:text-slate-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-slate-200 truncate">
                            {project.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(project.updatedAt).toLocaleDateString()}
                            {" · "}
                            {project.code.split("\n").length} lines
                          </p>
                        </>
                      )}
                    </div>

                    {editingName !== project.id && (
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(
                              menuOpen === project.id ? null : project.id
                            );
                          }}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-600 text-slate-400 hover:text-slate-200 transition"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>

                        {menuOpen === project.id && (
                          <>
                            <div
                              className="fixed inset-0 z-50"
                              onClick={() => setMenuOpen(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-36 bg-slate-700 rounded-lg border border-slate-600 shadow-xl z-50 py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRename(project.id);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-600 transition"
                              >
                                <Edit3 className="h-3 w-3" />
                                Rename
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicate(project.id);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-600 transition"
                              >
                                <Copy className="h-3 w-3" />
                                Duplicate
                              </button>
                              <div className="border-t border-slate-600 my-1" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(project.id);
                                  setMenuOpen(null);
                                }}
                                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}