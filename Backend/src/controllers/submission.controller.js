import Submission from "../models/submission.model.js";
import User from "../models/user.model.js";
import Problem from "../models/problem.model.js";

const allowedLanguages = ["python", "java", "cpp"];

async function allSubmissionsByUser(req, res) {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const submissions = await Submission.find({ user: userId })
      .select("problem language code verdict")
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error("Error in getting all submissions by user:", error);
    res.status(500).json({ error: "Error fetching submissions" });
  }
}

async function problemSubmissionsByUser(req, res) {
  try {
    const userId = req.user._id;
    const problemId = req.params.problemId;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const submissions = await Submission.find({
      user: userId,
      problem: problemId,
    })
      .select("problem language code verdict")
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (error) {
    console.error("Error in getting problem submissions by user:", error);
    res.status(500).json({ error: "Error fetching problem submissions" });
  }
}

async function getSubmissionById(req, res) {
  try {
    const submissionId = req.params.submissionId;
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }
    res.json({
      code: submission.code,
      language: submission.language,
      verdict: submission.verdict,
      submittedAt: submission.submittedAt,
    });
  } catch (error) {
    console.error("Error in getting submission by ID:", error);
    res.status(500).json({ error: "Error fetching submission" });
  }
}

async function createSubmission(req, res) {
  try {
    const { problemId } = req.params;
    const userId = req.user._id;
    const { language, code, isInContest } = req.body;

    if (!allowedLanguages.includes(language)) {
      return res.status(400).json({ error: "Invalid programming language" });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const newSubmission = new Submission({
      user: userId,
      problem: problemId,
      language,
      code,
      isInContest: isInContest || false,
    });
    await newSubmission.save();
    res.status(201).json({
      code: newSubmission.code,
      verdict: newSubmission.verdict,
      submittedAt: newSubmission.submittedAt,
      language: newSubmission.language,
    });
  } catch (error) {
    console.error("Error in creating submission:", error);
    res.status(500).json({ error: "Error creating submission" });
  }
}

export {
  allSubmissionsByUser,
  problemSubmissionsByUser,
  getSubmissionById,
  createSubmission,
};
