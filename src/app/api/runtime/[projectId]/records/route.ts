import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coerceRecord, parseConfigJson } from "@/lib/runtime";

async function getProject(projectId: string, userId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = getSessionUser(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const entity = req.nextUrl.searchParams.get("entity") || undefined;
  const project = await getProject(projectId, session.id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const records = await prisma.appRecord.findMany({
    where: {
      projectId,
      ...(entity ? { entity } : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(records);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = getSessionUser(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await getProject(projectId, session.id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = (await req.json()) as {
    entity?: unknown;
    records?: unknown;
    data?: unknown;
    [key: string]: unknown;
  };
  const { config } = parseConfigJson(project.json);
  const entityName = typeof body.entity === "string" ? body.entity : config.entities[0]?.name;
  const entity = config.entities.find((item) => item.name === entityName);

  if (!entity) {
    return NextResponse.json({ error: "Unknown entity" }, { status: 400 });
  }

  const rows = (Array.isArray(body.records) ? body.records : [body.data || body]) as Record<string, unknown>[];
  const prepared = rows.map((row: Record<string, unknown>) => coerceRecord(entity, row));
  const failed = prepared.find((row) => Object.keys(row.errors).length > 0);

  if (failed) {
    return NextResponse.json({ error: "Validation failed", fields: failed.errors }, { status: 422 });
  }

  if (prepared.length > 1) {
    await prisma.appRecord.createMany({
      data: prepared.map((row) => ({
        projectId,
        entity: entity.name,
        data: row.data as Prisma.InputJsonValue,
      })),
    });

    return NextResponse.json({ message: "Records imported", count: prepared.length }, { status: 201 });
  }

  const record = await prisma.appRecord.create({
    data: {
      projectId,
      entity: entity.name,
      data: prepared[0].data as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
