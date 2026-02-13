import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // FIX: Await params
  const { id } = await params;

  const { content } = await req.json();
  if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

  await dbConnect();

  const updatedTask = await Task.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { 
      $push: { 
        updates: { 
          content, 
          createdAt: new Date() 
        } 
      } 
    },
    { returnDocument: 'after' }
  );

  if (!updatedTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(updatedTask);
}