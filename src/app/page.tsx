import Link from "next/link";
import { ArrowRight, Database, FileJson, ShieldCheck, Workflow } from "lucide-react";

const features = [
  { icon: FileJson, label: "Metadata UI", text: "Forms, tables, dashboards, and layouts generated from JSON." },
  { icon: Database, label: "Runtime Data", text: "User-scoped records stored through Prisma and PostgreSQL." },
  { icon: Workflow, label: "Workflows", text: "Create and delete events trigger integrated notifications." },
  { icon: ShieldCheck, label: "Resilience", text: "Unknown components and invalid fields fail gracefully." },
];

const codeSample = [
  "{",
  '  "appName": "Campus Issue Desk",',
  '  "entities": ["tickets"],',
  '  "pages": ["form", "table", "dashboard"],',
  '  "workflows": ["notify-on-create"]',
  "}",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto grid min-h-screen max-w-7xl content-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Full Stack Track A Submission</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
            AI App Generator
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            A metadata-driven runtime that turns JSON configuration into working applications with generated UI, scoped APIs,
            dynamic records, CSV import, workflow notifications, and defensive validation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/editor"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-slate-950 hover:bg-slate-100"
            >
              Open Studio
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-lg border border-white/20 px-5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="grid content-center gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-2xl">
            <div className="rounded-lg bg-slate-900 p-5 font-mono text-sm text-slate-200">
              {codeSample.map((line) => (
                <p key={line} className={line === "{" || line === "}" ? "text-cyan-300" : "pl-4"}>
                  {line}
                </p>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.label} className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
                <feature.icon className="h-5 w-5 text-cyan-300" />
                <h2 className="mt-3 font-semibold">{feature.label}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-300">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
