import Contest from "../models/contest.model.js";
import Submission from "../models/submission.model.js";

async function getAllContests(req, res) {
  try {
    const contests = await Contest.find()
      .populate("createdBy", "username email")
      .lean();

    const now = new Date();

    const filteredContests = contests.map((contest) => {
      // Admin sees everything
      if (req.user?.role === "admin") {
        return contest;
      }

      // Contest has not started
      if (now < new Date(contest.startTime)) {
        return {
          _id: contest._id,
          title: contest.title,
          description: contest.description,
          startTime: contest.startTime,
          endTime: contest.endTime,
          message: "Contest details are hidden until it starts",
        };
      }

      // Contest is ongoing or completed
      return contest;
    });

    res.status(200).json(filteredContests);
  } catch (error) {
    console.error("Error fetching contests:", error);
    res.status(500).json({ message: "Error fetching contests" });
  }
}

async function getContestById(req, res) {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id).lean();

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const now = new Date(); // Use single now reference

    // Hide details before contest starts for non-admins
    if (now < new Date(contest.startTime) && req.user?.role !== "admin") {
      return res.status(200).json({
        _id: contest._id,
        title: contest.title,
        description: contest.description,
        startTime: contest.startTime,
        endTime: contest.endTime,
        message: "Contest details are hidden until it starts",
      });
    }

    // Admins or ongoing/ended contests see full details
    return res.status(200).json(contest);
  } catch (error) {
    console.error("Error fetching contest:", error);
    res.status(500).json({ message: "Error fetching contest" });
  }
}

async function createContest(req, res) {
  try {
    const { title, description, startTime, endTime, problems } = req.body;
    const createdBy = req.user.id;
    const newContest = new Contest({
      title,
      description,
      startTime,
      endTime,
      createdBy,
      problems,
    });
    await newContest.save();
    res.status(201).json(newContest);
  } catch (error) {
    console.error("Error creating contest:", error);
    res.status(500).json({ message: "Error creating contest" });
  }
}

async function updateContest(req, res) {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, problems } = req.body;

    const updatedContest = await Contest.findByIdAndUpdate(
      id,
      {
        title,
        description,
        startTime,
        endTime,
        problems,
      },
      { new: true, runValidators: true }
    );

    if (!updatedContest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    res.status(200).json(updatedContest);
  } catch (error) {
    console.error("Error updating contest:", error);
    res.status(500).json({ message: "Error updating contest" });
  }
}

async function deleteContest(req, res) {
  try {
    const { id } = req.params;
    const deletedContest = await Contest.findByIdAndDelete(id);
    if (!deletedContest) {
      return res.status(404).json({ message: "Contest not found" });
    }
    res.status(204).json({ message: "Contest deleted successfully" });
  } catch (error) {
    console.error("Error deleting contest:", error);
    res.status(500).json({ message: "Error deleting contest" });
  }
}

async function joinContest(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const contest = await Contest.findById(id);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    if (new Date() > contest.endTime) {
      return res.status(400).json({ message: "Contest is over" });
    }

    if (!contest.participants.some((p) => p.toString() === userId)) {
      contest.participants.push(userId);
    }
    await contest.save();

    res.status(200).json({ message: "Successfully joined the contest" });
  } catch (error) {
    console.error("Error joining contest:", error);
    res.status(500).json({ message: "Error joining contest" });
  }
}

async function submitSolution(req, res) {
  try {
    const { id: contestId, problemId } = req.params;
    const userId = req.user.id;
    const { code, language } = req.body;
    // Replace with Judge Score
    let score = 0;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    if (!contest.participants.includes(userId)) {
      return res.status(403).json({ message: "User is not a participant" });
    }

    if (contest.endTime < new Date()) {
      return res.status(400).json({ message: "Contest has ended" });
    }

    if (contest.startTime > new Date()) {
      return res.status(400).json({ message: "Contest has not started yet" });
    }

    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      isInContest: true,
    });

    await submission.save();

    let leaderboardEntry = contest.leaderboard.find((entry) =>
      entry.user.equals(userId)
    );
    if (!leaderboardEntry) {
      leaderboardEntry = {
        user: userId,
        totalScore: 0,
        problemScores: [],
        submissions: [],
        rank: 0,
      };
      contest.leaderboard.push(leaderboardEntry);
    }

    leaderboardEntry.submissions.push(submission._id);
    const problemScoreIndex = leaderboardEntry.problemScores.findIndex((ps) =>
      ps.problem.equals(problemId)
    );
    if (problemScoreIndex === -1) {
      leaderboardEntry.problemScores.push({ problem: problemId, score });
    } else {
      leaderboardEntry.problemScores[problemScoreIndex].score = Math.max(
        leaderboardEntry.problemScores[problemScoreIndex].score,
        score
      );
    }

    leaderboardEntry.totalScore = leaderboardEntry.problemScores.reduce(
      (total, ps) => total + ps.score,
      0
    );

    contest.leaderboard.sort((a, b) => b.totalScore - a.totalScore);
    contest.leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    await contest.save();

    res.status(201).json({
      submission,
      leaderboard: contest.leaderboard,
    });
  } catch (error) {
    console.error("Error submitting solution:", error);
    res.status(500).json({ message: "Error submitting solution" });
  }
}

async function getContestLeaderboard(req, res) {
  try {
    const { id: contestId } = req.params;
    const contest = await Contest.findById(contestId).populate(
      "leaderboard.user",
      "username"
    );

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    contest.leaderboard = contest.leaderboard.slice(0, 10);

    res.status(200).json(contest.leaderboard);
  } catch (error) {
    console.error("Error fetching contest leaderboard:", error);
    res.status(500).json({ message: "Error fetching contest leaderboard" });
  }
}

export {
  getAllContests,
  getContestById,
  createContest,
  updateContest,
  deleteContest,
  joinContest,
  submitSolution,
  getContestLeaderboard,
};
