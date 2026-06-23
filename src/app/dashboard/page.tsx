"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Database, FileJson, LayoutDashboard, Plus, Workflow } from "lucide-react";

type Project = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    records: number;
  };
};

export default function Dashboard() {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function load() {
      const [meRes, projectsRes] = await Promise.all([fetch("/api/me"), fetch("/api/projects")]);

      if (meRes.ok) setUser(await meRes.json());
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    }

    load();
  }, []);

  const totalRecords = useMemo(
    () => projects.reduce((sum, project) => sum + (project._count?.records || 0), 0),
    [projects]
  );

  const stats = [
    { label: "Generated Apps", value: projects.length, icon: FileJson },
    { label: "Runtime Records", value: totalRecords, icon: Database },
    { label: "Included Features", value: 3, icon: Workflow },
  ];

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Runtime Console</p>
            <h1 className="mt-1 text-3xl font-semibold">Welcome{user?.name ? `, ${user.name}` : ""}</h1>
            <p className="mt-2 text-slate-600">Build, run, and inspect metadata-driven applications.</p>
          </div>
          <Link
            href="/editor"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Create App
          </Link>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <stat.icon className="h-5 w-5 text-slate-500" />
              <p className="mt-4 text-sm text-slate-500">{stat.label}</p>
              <p className="mt-1 text-3xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold">Recent Projects</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {projects.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No generated apps yet.</div>
              ) : (
                projects.slice(0, 6).map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"
                  >
                    <div>
                      <h3 className="font-medium text-slate-950">{project.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {project._count?.records || 0} records · {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <LayoutDashboard className="h-4 w-4 text-slate-400" />
                  </Link>
                ))
              )}
            </div>
          </div>

          <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Implemented Track A Extras</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <p className="rounded-lg bg-slate-50 p-3">CSV import maps uploaded rows into generated runtime records.</p>
              <p className="rounded-lg bg-slate-50 p-3">Notifications are driven by workflow metadata on create/delete events.</p>
              <p className="rounded-lg bg-slate-50 p-3">Mobile-friendly runtime works across form, table, and dashboard pages.</p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
