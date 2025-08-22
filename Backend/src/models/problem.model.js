import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 5000,
      trim: true,
    },
    constraints: {
      type: [String],
      default: [],
    },
    examples: [
      {
        input: {
          type: String,
          required: true,
        },
        output: {
          type: String,
          required: true,
        },
        explanation: {
          type: String,
        },
      },
    ],
    tags: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
      index: true,
    },
    testCases: {
      type: [
        {
          input: {
            type: String,
            required: true,
          },
          output: {
            type: String,
            required: true,
          },
          hidden: {
            type: Boolean,
            default: false,
          },
        },
      ],
      required: true,
      validate: [(arr) => arr.length > 0, "At least one test case is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

problemSchema.index({ tags: 1 });
problemSchema.index({ tags: 1, difficulty: 1 });
problemSchema.index({ title: "text", description: "text" });

export default mongoose.model("Problem", problemSchema);
