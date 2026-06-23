"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Check, Code2, Loader2, Save } from "lucide-react";
import RuntimePreview from "@/components/runtime/RuntimePreview";
import { parseConfigJson } from "@/lib/runtime";

const sampleJson = `{
  "appName": "Campus Issue Desk",
  "description": "A generated operations app for tracking student support requests.",
  "locale": "en",
  "entities": [
    {
      "name": "tickets",
      "label": "Support Tickets",
      "fields": [
        { "name": "student_name", "label": "Student Name", "type": "text", "required": true },
        { "name": "email", "label": "Email", "type": "email", "required": true },
        { "name": "category", "label": "Category", "type": "select", "options": ["Hostel", "Fees", "Exam", "Transport"], "required": true },
        { "name": "priority", "label": "Priority", "type": "select", "options": ["Low", "Medium", "High"], "defaultValue": "Medium" },
        { "name": "description", "label": "Description", "type": "textarea" }
      ]
    }
  ],
  "pages": [
    { "id": "new-ticket", "title": "New Ticket", "type": "form", "entity": "tickets" },
    { "id": "ticket-table", "title": "Ticket Queue", "type": "table", "entity": "tickets" },
    { "id": "ops-dashboard", "title": "Operations Dashboard", "type": "dashboard", "entity": "tickets" }
  ],
  "workflows": [
    { "name": "Ticket notification", "trigger": "create", "action": "notify", "message": "New ticket captured and routed to the operations queue." },
    { "name": "Delete audit", "trigger": "delete", "action": "notify", "message": "Record removed from the generated runtime." }
  ]
}`;

function EditorClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("id");
  const [json, setJson] = useState(sampleJson);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const parsed = useMemo(() => parseConfigJson(json), [json]);

  useEffect(() => {
    if (!projectId) return;

    async function loadProject() {
      setLoading(true);
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const project = await res.json();

        if (!res.ok) {
          setMessage(project.message || "Project not found.");
          return;
        }

        setJson(project.json);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  async function saveProject() {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(projectId ? `/api/projects/${projectId}` : "/api/projects", {
        method: projectId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || data.error || "Project could not be saved.");
        return;
      }

      setMessage(projectId ? "Project updated successfully." : "Project created successfully.");
      if (!projectId) {
        router.replace(`/editor?id=${data.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700">
        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
        Loading project...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Track A Full Stack Runtime</p>
            <h1 className="mt-1 text-3xl font-semibold">AI App Generator Studio</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Edit JSON metadata, validate the schema, generate UI, persist app data, import CSV rows, and run workflow notifications.
            </p>
          </div>
          <button
            type="button"
            onClick={saveProject}
            disabled={saving || Boolean(parsed.error)}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {projectId ? "Update Project" : "Save Project"}
          </button>
        </header>

        <section className="grid gap-6 xl:grid-cols-[440px_1fr]">
          <div className="grid gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-slate-500" />
                  <h2 className="font-semibold">Application JSON</h2>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  {json.length.toLocaleString()} chars
                </span>
              </div>
              <textarea
                value={json}
                onChange={(event) => setJson(event.target.value)}
                spellCheck={false}
                className="h-[560px] w-full resize-none rounded-lg border border-slate-300 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none transition focus:border-slate-500"
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              {parsed.error ? (
                <div className="flex gap-3 text-sm text-rose-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  <p>{parsed.error}</p>
                </div>
              ) : (
                <div className="grid gap-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2 font-medium text-emerald-700">
                    <Check className="h-4 w-4" />
                    Runtime schema is valid
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-slate-500">Entities</p>
                      <p className="text-xl font-semibold">{parsed.config.entities.length}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-slate-500">Pages</p>
                      <p className="text-xl font-semibold">{parsed.config.pages.length}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-slate-500">Workflows</p>
                      <p className="text-xl font-semibold">{parsed.config.workflows.length}</p>
                    </div>
                  </div>
                </div>
              )}
              {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
            </div>
          </div>

          <RuntimePreview config={parsed.config} projectId={projectId} />
        </section>
      </div>
    </main>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-700">
          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
          Loading studio...
        </div>
      }
    >
      <EditorClient />
    </Suspense>
  );
}
