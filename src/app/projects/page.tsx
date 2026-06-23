"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Edit3, ExternalLink, Plus, Search, Trash2 } from "lucide-react";

interface Project {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    records: number;
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  const filteredProjects = useMemo(
    () => projects.filter((project) => project.title.toLowerCase().includes(search.toLowerCase())),
    [projects, search]
  );

  async function deleteProject(id: string) {
    const confirmDelete = confirm("Delete this generated app and its runtime records?");

    if (!confirmDelete) return;

    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });

    if (res.ok) {
      fetchProjects();
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Saved Generated Apps</p>
            <h1 className="mt-1 text-3xl font-semibold">Projects</h1>
          </div>
          <Link
            href="/editor"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </header>

        <div className="mt-6 flex max-w-md items-center gap-2 rounded-lg border border-slate-300 bg-white px-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 w-full bg-transparent text-sm outline-none"
          />
        </div>

        {loading ? (
          <p className="mt-8 text-slate-600">Loading projects...</p>
        ) : filteredProjects.length === 0 ? (
          <section className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">No projects found</h2>
            <p className="mt-2 text-slate-500">Create a metadata app from the studio to see it here.</p>
          </section>
        ) : (
          <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <article key={project.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold">{project.title}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {project._count?.records || 0} records · Updated {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </Link>
                  <Link
                    href={`/editor?id=${project.id}`}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteProject(project.id)}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
