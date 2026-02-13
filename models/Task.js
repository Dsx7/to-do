import mongoose, { Schema, models, model } from "mongoose";

// Schema for the "Activity Log" updates
const UpdateSchema = new Schema({
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const TaskSchema = new Schema({
    title: { type: String, required: true },
    userId: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    startTime: { type: Date },
    deadline: { type: Date },
    timeLimit: { type: Number }, // in minutes
    parentId: { type: String, default: null }, // Self-referencing for subtasks
    updates: [UpdateSchema],
}, { timestamps: true });

// Virtual field to populate subtasks automatically
TaskSchema.virtual("subtasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "parentId",
});

// Ensure virtuals are included when converting to JSON/Object
TaskSchema.set("toObject", { virtuals: true });
TaskSchema.set("toJSON", { virtuals: true });

export default models.Task || model("Task", TaskSchema);