import express from "express";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import problemRouter from "./routes/problem.route.js";
import discussionRouter from "./routes/discussion.route.js";
import submissionRouter from "./routes/submission.route.js";

const app = express();
dotenv.config();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/problems", problemRouter);
app.use("/api/problems/:problemId/discussions", discussionRouter);
app.use("/api/submissions", submissionRouter);

app.listen(process.env.PORT, () => {
  connectDB();
  console.log(`Server is running on port ${process.env.PORT}`);
});
