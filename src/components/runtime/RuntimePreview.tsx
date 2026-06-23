"use client";

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Database,
  FileUp,
  LayoutDashboard,
  Loader2,
  Plus,
  Table2,
  Trash2,
} from "lucide-react";
import { RuntimeConfig, RuntimeEntity, RuntimePage } from "@/lib/runtime";

type RecordItem = {
  id: string;
  entity: string;
  data: Record<string, string | number | boolean | null>;
  createdAt?: string;
};

type RuntimePreviewProps = {
  config: RuntimeConfig;
  projectId?: string | null;
};

function getInitialForm(entity?: RuntimeEntity) {
  return Object.fromEntries(
    (entity?.fields || []).map((field) => [field.name, field.defaultValue ?? (field.type === "checkbox" ? false : "")])
  );
}

function FieldInput({
  entity,
  values,
  errors,
  onChange,
}: {
  entity: RuntimeEntity;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  onChange: (name: string, value: unknown) => void;
}) {
  return (
    <div className="grid gap-4">
      {entity.fields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          No fields are defined for this entity. Add fields in the JSON config to generate a form.
        </div>
      ) : (
        entity.fields.map((field) => (
          <label key={field.name} className="grid gap-2 text-sm font-medium text-slate-700">
            <span>
              {field.label}
              {field.required ? <span className="text-rose-600"> *</span> : null}
            </span>
            {field.type === "textarea" ? (
              <textarea
                value={String(values[field.name] ?? "")}
                onChange={(event) => onChange(field.name, event.target.value)}
                className="min-h-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
              />
            ) : field.type === "select" ? (
              <select
                value={String(values[field.name] ?? "")}
                onChange={(event) => onChange(field.name, event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
              >
                <option value="">Select {field.label}</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <span className="flex h-10 items-center gap-3 rounded-lg border border-slate-300 bg-white px-3">
                <input
                  type="checkbox"
                  checked={Boolean(values[field.name])}
                  onChange={(event) => onChange(field.name, event.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-slate-600">Enabled</span>
              </span>
            ) : (
              <input
                type={field.type}
                value={String(values[field.name] ?? "")}
                onChange={(event) => onChange(field.name, event.target.value)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-slate-900 outline-none transition focus:border-slate-900"
              />
            )}
            {field.warning ? <span className="text-xs text-amber-700">{field.warning}</span> : null}
            {errors[field.name] ? <span className="text-xs text-rose-600">{errors[field.name]}</span> : null}
          </label>
        ))
      )}
    </div>
  );
}

export default function RuntimePreview({ config, projectId }: RuntimePreviewProps) {
  const [activePageId, setActivePageId] = useState(config.pages[0]?.id || "");
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("Runtime ready.");
  const [loading, setLoading] = useState(false);

  const activePage = config.pages.find((page) => page.id === activePageId) || config.pages[0];
  const activeEntity = config.entities.find((entity) => entity.name === activePage?.entity) || config.entities[0];
  const pageRecords = records.filter((record) => record.entity === activeEntity?.name);

  useEffect(() => {
    async function loadRecords() {
      if (!projectId) {
        setRecords([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/runtime/${projectId}/records`);
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    }

    loadRecords();
  }, [projectId]);

  const metrics = useMemo(
    () => [
      { label: "Entities", value: config.entities.length },
      { label: "Pages", value: config.pages.length },
      { label: "Records", value: records.length },
      { label: "Workflows", value: config.workflows.length },
    ],
    [config.entities.length, config.pages.length, config.workflows.length, records.length]
  );

  function runWorkflow(trigger: "create" | "update" | "delete") {
    const workflow = config.workflows.find((item) => item.trigger === trigger && item.action === "notify");
    setNotice(workflow?.message || `${trigger[0].toUpperCase()}${trigger.slice(1)} completed successfully.`);
  }

  async function submitRecord() {
    if (!activeEntity) return;

    setLoading(true);
    setErrors({});

    try {
      if (projectId) {
        const res = await fetch(`/api/runtime/${projectId}/records`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entity: activeEntity.name, data: formValues }),
        });
        const data = await res.json();

        if (!res.ok) {
          setErrors(data.fields || {});
          setNotice(data.error || "Record could not be saved.");
          return;
        }

        setRecords((current) => [data, ...current]);
      } else {
        setRecords((current) => [
          {
            id: crypto.randomUUID(),
            entity: activeEntity.name,
            data: formValues as Record<string, string | number | boolean | null>,
            createdAt: new Date().toISOString(),
          },
          ...current,
        ]);
      }

      setFormValues(getInitialForm(activeEntity));
      runWorkflow("create");
    } finally {
      setLoading(false);
    }
  }

  async function deleteRecord(recordId: string) {
    if (projectId) {
      await fetch(`/api/runtime/${projectId}/records/${recordId}`, { method: "DELETE" });
    }

    setRecords((current) => current.filter((record) => record.id !== recordId));
    runWorkflow("delete");
  }

  function importCsv(file?: File) {
    if (!file || !activeEntity) return;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const rows = result.data.map((row) =>
          Object.fromEntries(activeEntity.fields.map((field) => [field.name, row[field.name] || row[field.label] || ""]))
        );

        if (projectId) {
          const res = await fetch(`/api/runtime/${projectId}/records`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entity: activeEntity.name, records: rows }),
          });
          const data = await res.json();

          if (!res.ok) {
            setErrors(data.fields || {});
            setNotice(data.error || "CSV import failed.");
            return;
          }

          const refreshed = await fetch(`/api/runtime/${projectId}/records?entity=${activeEntity.name}`);
          const imported = await refreshed.json();
          setRecords((current) => [
            ...current.filter((record) => record.entity !== activeEntity.name),
            ...(Array.isArray(imported) ? imported : []),
          ]);
          setNotice(`${data.count || rows.length} records imported from CSV.`);
        } else {
          setRecords((current) => [
            ...rows.map((row) => ({
              id: crypto.randomUUID(),
              entity: activeEntity.name,
              data: row,
              createdAt: new Date().toISOString(),
            })),
            ...current,
          ]);
          setNotice(`${rows.length} records staged from CSV.`);
        }
      },
    });
  }

  function renderPage(page?: RuntimePage) {
    if (!page || !activeEntity) {
      return (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
          Add an entity and a page to render the generated app.
        </div>
      );
    }

    if (page.type === "unknown") {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          {page.warning} This page was skipped without breaking the app.
        </div>
      );
    }

    if (page.type === "dashboard") {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{metric.value}</p>
            </div>
          ))}
        </div>
      );
    }

    if (page.type === "table") {
      return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div>
              <h3 className="font-semibold text-slate-950">{activeEntity.label}</h3>
              <p className="text-sm text-slate-500">{pageRecords.length} records</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <FileUp className="h-4 w-4" />
              Import CSV
              <input type="file" accept=".csv" className="hidden" onChange={(event) => importCsv(event.target.files?.[0])} />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {activeEntity.fields.map((field) => (
                    <th key={field.name} className="px-4 py-3 font-medium">
                      {field.label}
                    </th>
                  ))}
                  <th className="w-16 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRecords.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={activeEntity.fields.length + 1}>
                      No records yet. Submit the form or import a CSV.
                    </td>
                  </tr>
                ) : (
                  pageRecords.map((record) => (
                    <tr key={record.id}>
                      {activeEntity.fields.map((field) => (
                        <td key={field.name} className="px-4 py-3 text-slate-700">
                          {String(record.data?.[field.name] ?? "")}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteRecord(record.id)}
                          className="rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <FieldInput
          entity={activeEntity}
          values={formValues}
          errors={errors}
          onChange={(name, value) => setFormValues((current) => ({ ...current, [name]: value }))}
        />
        <button
          type="button"
          onClick={submitRecord}
          disabled={loading || activeEntity.fields.length === 0}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Submit Record
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-100 p-3">
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <header className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Generated Runtime</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">{config.title}</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">{config.description}</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              {config.locale.toUpperCase()}
            </div>
          </div>
        </header>

        {config.warnings.length > 0 ? (
          <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
              <p>{config.warnings.slice(0, 3).join(" ")}</p>
            </div>
          </div>
        ) : null}

        <div className="grid min-h-[520px] lg:grid-cols-[220px_1fr]">
          <aside className="border-b border-slate-200 bg-slate-50 p-3 lg:border-b-0 lg:border-r">
            <nav className="grid gap-1">
              {config.pages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => {
                    setActivePageId(page.id);
                    const nextEntity = config.entities.find((entity) => entity.name === page.entity) || config.entities[0];
                    setFormValues(getInitialForm(nextEntity));
                    setErrors({});
                  }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    page.id === activePage?.id ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-white"
                  }`}
                >
                  {page.type === "dashboard" ? (
                    <LayoutDashboard className="h-4 w-4" />
                  ) : page.type === "table" ? (
                    <Table2 className="h-4 w-4" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  {page.title}
                </button>
              ))}
            </nav>
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-medium text-slate-900">
                <Bell className="h-4 w-4" />
                Notification
              </div>
              <p className="mt-2">{notice}</p>
            </div>
          </aside>

          <main className="p-4 sm:p-6">
            <div className="mb-5">
              <h3 className="text-xl font-semibold text-slate-950">{activePage?.title || "Preview"}</h3>
              <p className="text-sm text-slate-500">{activeEntity?.label || "No entity selected"}</p>
            </div>
            {renderPage(activePage)}
          </main>
        </div>
      </div>
    </section>
  );
}
