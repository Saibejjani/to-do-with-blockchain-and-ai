const { Schema, model } = require("mongoose");

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    transactionHash: {
      type: String,
      required: false,
    },
    taskHash: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

const Task = model("task", taskSchema);
module.exports = Task;
