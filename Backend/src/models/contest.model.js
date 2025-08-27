import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  problems: {
    type: [
      {
        problem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Problem",
          required: true,
        },
        points: {
          type: Number,
          default: 4,
        },
      },
    ],
    validate: {
      validator: function (v) {
        return v.length >= 3;
      },
      message: "At least three problems must be added.",
    },
  },
  description: {
    type: String,
    default: " ",
  },
  startTime: {
    type: Date,
    required: true,
    validate: {
      validator: function (start) {
        return this.isNew ? start > new Date() : true;
      },
      message: "Start time must be in the future.",
    },
  },
  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function (end) {
        return end > this.startTime;
      },
      message: "End time must be after start time.",
    },
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  leaderboard: {
    type: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        totalScore: {
          type: Number,
          default: 0,
        },
        problemScores: {
          type: [
            {
              problem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Problem",
              },
              score: {
                type: Number,
                default: 0,
              },
            },
          ],
        },
        submissions: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Submission",
          },
        ],
        rank: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming",
  },
});

contestSchema.index({ startTime: 1, endTime: 1 });
contestSchema.index({ createdBy: 1 });

contestSchema.virtual("timeLeft").get(function () {
  const now = new Date();
  const end = this.endTime;
  const timeDiff = end - now;
  return timeDiff > 0 ? timeDiff : 0;
});

contestSchema.pre("save", function (next) {
  const now = new Date();
  if (now < this.startTime) this.status = "upcoming";
  else if (now >= this.startTime && now <= this.endTime)
    this.status = "ongoing";
  else this.status = "completed";
  next();
});

const Contest = mongoose.model("Contest", contestSchema);

export default Contest;
