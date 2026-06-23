import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coerceRecord, parseConfigJson } from "@/lib/runtime";

async function getOwnedRecord(projectId: string, recordId: string, userId: string) {
  return prisma.appRecord.findFirst({
    where: {
      id: recordId,
      projectId,
      project: {
        userId,
      },
    },
    include: {
      project: true,
    },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; recordId: string }> }
) {
  const session = getSessionUser(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, recordId } = await params;
  const record = await getOwnedRecord(projectId, recordId, session.id);

  if (!record) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  const body = await req.json();
  const { config } = parseConfigJson(record.project.json);
  const entity = config.entities.find((item) => item.name === record.entity);

  if (!entity) {
    return NextResponse.json({ error: "Unknown entity" }, { status: 400 });
  }

  const prepared = coerceRecord(entity, body.data || body);

  if (Object.keys(prepared.errors).length > 0) {
    return NextResponse.json({ error: "Validation failed", fields: prepared.errors }, { status: 422 });
  }

  const updated = await prisma.appRecord.update({
    where: { id: recordId },
    data: { data: prepared.data as Prisma.InputJsonValue },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; recordId: string }> }
) {
  const session = getSessionUser(req);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, recordId } = await params;
  const record = await getOwnedRecord(projectId, recordId, session.id);

  if (!record) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  await prisma.appRecord.delete({ where: { id: recordId } });

  return NextResponse.json({ message: "Record deleted" });
}
