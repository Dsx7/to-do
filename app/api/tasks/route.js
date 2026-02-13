import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import { authOptions } from "../auth/[...nextauth]/route"; // IMPORT THIS

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const userId = session.user.id;

  const tasks = await Task.find({ userId, parentId: null })
    .populate({
      path: "subtasks",
      populate: { path: "subtasks" },
    })
    .sort({ createdAt: -1 }) // <--- THIS FIXES THE SORTING (Newest First)
    .lean();

  return NextResponse.json(tasks);
}

export async function POST(req) {
  // PASS authOptions HERE
  const session = await getServerSession(authOptions);
  
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await dbConnect();

  if (body.parentId) {
    const parent = await Task.findById(body.parentId);
    if (!parent) return NextResponse.json({ error: "Parent not found" }, { status: 404 });
  }

  // Debug log to confirm we have the ID now
  console.log("Creating task for User ID:", session.user.id);

  const task = await Task.create({
    ...body,
    userId: session.user.id, // This should now work
  });

  return NextResponse.json(task);
}