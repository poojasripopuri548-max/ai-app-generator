import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { parseConfigJson } from "@/lib/runtime";

export async function POST(req: NextRequest) {
  try {
    const session = getSessionUser(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { json } = await req.json();
    const source = typeof json === "string" ? json : "{}";
    const { config, error } = parseConfigJson(source);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title: config.title,
        json: source,
        userId: session.id,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to save project" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = getSessionUser(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: session.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        _count: {
          select: {
            records: true,
          },
        },
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
