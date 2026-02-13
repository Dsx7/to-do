import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // FIX 1: Await the params object (Required in Next.js 15)
  const { id } = await params;

  const body = await req.json();
  await dbConnect();

  const task = await Task.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    body,
    // FIX 2: Mongoose update (new: true is deprecated)
    { returnDocument: 'after' } 
  );

  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  return NextResponse.json(task);
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // FIX 1: Await params here too
  const { id } = await params;

  await dbConnect();
  await Task.findOneAndDelete({ _id: id, userId: session.user.id });

  return NextResponse.json({ success: true });
}