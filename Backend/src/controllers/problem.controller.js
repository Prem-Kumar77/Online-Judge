import Problem from "../models/problem.model.js";

async function getAllProblems(req, res) {
  try {
    const allProblems = await Problem.find({})
      .select("title difficulty tags author createdAt")
      .populate("author", "username")
      .lean({ virtuals: true });

    const problemsWithCounts = allProblems.map((p) => ({
      ...p,
      likesCount: p.likes?.length || 0,
      dislikesCount: p.dislikes?.length || 0,
    }));

    res.status(200).json(problemsWithCounts);
  } catch (error) {
    console.error("Error in /problems/all:", error);
    res.status(500).json({ message: "Problem in getting problems" });
  }
}

async function getProblemById(req, res) {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id)
      .populate("author", "username")
      .lean({ virtuals: true });

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    res.status(200).json(problem);
  } catch (error) {
    console.error("Error in /problems/:id:", error);
    res.status(500).json({ message: "Problem in getting problem by ID" });
  }
}

async function toggleLikeProblem(req, res) {
  try {
    const { id } = req.params;
    const userid = req.user._id;
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (problem.likes.includes(userid)) {
      problem.likes.pull(userid);
    } else {
      problem.likes.addToSet(userid);
      problem.dislikes.pull(userid);
    }

    await problem.save();

    const updatedProblem = await Problem.findById(id).lean({ virtuals: true });

    res.status(200).json({
      message: "toggled like successfully",
      ...updatedProblem,
    });
  } catch (error) {
    console.error("Error in toggling like a problem : ", error);
    res.status(500).json({ message: "Problem in toggling like a problem" });
  }
}

async function toggleDislikeProblem(req, res) {
  try {
    const { id } = req.params;
    const userid = req.user._id;
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (problem.dislikes.includes(userid)) {
      problem.dislikes.pull(userid);
    } else {
      problem.dislikes.addToSet(userid);
      problem.likes.pull(userid);
    }

    await problem.save();

    const updatedProblem = await Problem.findById(id).lean({ virtuals: true });

    res.status(200).json({
      message: "toggled dislike successfully",
      ...updatedProblem,
    });
  } catch (error) {
    console.error("Error in toggling dislike a problem : ", error);
    res.status(500).json({ message: "Error in toggling dislike a problem" });
  }
}
export {
  getAllProblems,
  getProblemById,
  toggleLikeProblem,
  toggleDislikeProblem,
};
