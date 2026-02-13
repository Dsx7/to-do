import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import { authOptions } from "../auth/[...nextauth]/route"; // IMPORT THIS

export async function GET(req) {
  // PASS authOptions HERE
  const session = await getServerSession(authOptions);
  
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const userId = session.user.id;

  const tasks = await Task.find({ userId, parentId: null })
    .populate({
      path: "subtasks",
      populate: { path: "subtasks" },
    })
    .lean();

  const now = new Date();
  const sortedTasks = tasks.sort((a, b) => {
    const getScore = (t) => {
      if (t.isCompleted) return -1000;
      if (t.deadline) {
        const timeLeft = new Date(t.deadline).getTime() - now.getTime();
        if (timeLeft < 0) return 2000;
        if (timeLeft < 3600000) return 1000;
        return 500;
      }
      if (t.startTime) return 100;
      return 0;
    };
    return getScore(b) - getScore(a);
  });

  return NextResponse.json(sortedTasks);
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