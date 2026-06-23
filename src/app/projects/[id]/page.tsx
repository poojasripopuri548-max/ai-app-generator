import Link from "next/link";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { notFound, redirect } from "next/navigation";
import RuntimePreview from "@/components/runtime/RuntimePreview";
import { prisma } from "@/lib/prisma";
import { parseConfigJson } from "@/lib/runtime";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function OpenProject({ params }: Props) {
  const { id } = await params;
  const token = (await cookies()).get("token")?.value;

  if (!token || !process.env.JWT_SECRET) {
    redirect("/login");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
  const project = await prisma.project.findFirst({
    where: {
      id,
      userId: decoded.id,
    },
  });

  if (!project) {
    notFound();
  }

  const { config } = parseConfigJson(project.json);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Generated Application</p>
            <h1 className="mt-1 text-3xl font-semibold">{project.title}</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/projects"
              className="inline-flex h-10 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-white"
            >
              Projects
            </Link>
            <Link
              href={`/editor?id=${project.id}`}
              className="inline-flex h-10 items-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Edit Schema
            </Link>
          </div>
        </header>

        <RuntimePreview config={config} projectId={project.id} />
      </div>
    </main>
  );
}
