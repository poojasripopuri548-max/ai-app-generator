import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { parseConfigJson } from "@/lib/runtime";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionUser(req);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: {
        id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    if (project.userId !== session.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionUser(req);
    const { id } = await params;
    const { json } = await req.json();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.project.findFirst({
      where: {
        id,
        userId: session.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const source = typeof json === "string" ? json : "{}";
    const { config, error } = parseConfigJson(source);

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    const updatedProject = await prisma.project.update({
      where: {
        id,
      },
      data: {
        title: config.title,
        json: source,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Update Failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getSessionUser(req);
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: session.id,
      },
    });

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({
      message: "Project Deleted",
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Delete Failed" },
      { status: 500 }
    );
  }
}
