import Discussion from "../models/discussion.model.js";
import Problem from "../models/problem.model.js";

async function getProblemDiscussions(req, res) {
  try {
    const { problemId } = req.params;
    const discussions = await Discussion.find({ problem: problemId })
      .populate("author", "username email")
      .populate("comments.user", "username email")
      .lean();

    res.status(200).json(discussions);
  } catch (error) {
    console.error("Error in /problems/:id/discussions:", error);
    res.status(500).json({ message: "Problem in getting discussions" });
  }
}

async function addProblemDiscussion(req, res) {
  try {
    const { problemId } = req.params;
    const { content } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    const newDiscussion = new Discussion({
      problem: problem._id,
      author: req.user._id,
      content,
    });
    await newDiscussion.save();
    const populatedDiscussion = await Discussion.findById(newDiscussion._id)
      .populate("author", "username email")
      .populate("comments.user", "username email")
      .lean();
    res.status(201).json(populatedDiscussion);
  } catch (error) {
    console.error("Error in /problems/:id/discussions:", error);
    res.status(500).json({ message: "Problem in adding discussion" });
  }
}

async function addComment(req, res) {
  try {
    const { problemId, discussionId } = req.params;
    const { content } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.problem.toString() !== problemId) {
      return res.status(404).json({ message: "Discussion not found" });
    }
    const newComment = {
      user: req.user._id,
      content,
      createdAt: new Date(),
    };
    discussion.comments.push(newComment);
    await discussion.save();
    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate("author", "username email")
      .populate("comments.user", "username email")
      .lean();
    res.status(201).json(populatedDiscussion);
  } catch (error) {
    console.error("Error in /problems/:id/:discussionId:", error);
    res.status(500).json({ message: "Problem in adding comment" });
  }
}

async function toggleDiscussionLike(req, res) {
  try {
    const { problemId, discussionId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.problem.toString() !== problemId) {
      return res.status(404).json({ message: "Discussion not found" });
    }
    const userId = req.user._id;
    if (discussion.likes.includes(userId)) {
      discussion.likes.pull(userId);
    } else {
      discussion.likes.addToSet(userId);
      discussion.dislikes.pull(userId);
    }
    await discussion.save();
    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate("author", "username email")
      .populate("comments.user", "username email")
      .lean();
    res.status(200).json(populatedDiscussion);
  } catch (error) {
    console.error("Error in toggling discussion like:", error);
    res.status(500).json({ message: "Problem in toggling discussion like" });
  }
}

async function toggleDiscussionDislike(req, res) {
  try {
    const { problemId, discussionId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.problem.toString() !== problemId) {
      return res.status(404).json({ message: "Discussion not found" });
    }
    const userId = req.user._id;
    if (discussion.dislikes.includes(userId)) {
      discussion.dislikes.pull(userId);
    } else {
      discussion.dislikes.addToSet(userId);
      discussion.likes.pull(userId);
    }
    await discussion.save();
    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate("author", "username email")
      .populate("comments.user", "username email")
      .lean();
    res.status(200).json(populatedDiscussion);
  } catch (error) {
    console.error("Error in toggling discussion dislike: ", error);
    res.status(500).json({ message: "Problem in toggling discussion dislike" });
  }
}

async function toggleCommentLike(req, res) {
  try {
    const { problemId, discussionId, commentId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.problem.toString() !== problemId) {
      return res.status(404).json({ message: "Discussion not found" });
    }
    const comment = discussion.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    const userId = req.user._id;
    if (comment.likes.includes(userId)) {
      comment.likes.pull(userId);
    } else {
      comment.likes.addToSet(userId);
      comment.dislikes.pull(userId);
    }
    await discussion.save();
    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate("author", "username email")
      .populate("comments.user", "username email")
      .lean();
    res.status(200).json(populatedDiscussion);
  } catch (error) {
    console.error("Error in Handling toggle comment like: ", error);
    res.status(500).json({ message: "Problem in toggling comment like" });
  }
}

async function toggleCommentDislike(req, res) {
  try {
    const { problemId, discussionId, commentId } = req.params;
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.problem.toString() !== problemId) {
      return res.status(404).json({ message: "Discussion not found" });
    }
    const comment = discussion.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    const userId = req.user._id;
    if (comment.dislikes.includes(userId)) {
      comment.dislikes.pull(userId);
    } else {
      comment.dislikes.addToSet(userId);
      comment.likes.pull(userId);
    }
    await discussion.save();
    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate("author", "username email")
      .populate("comments.user", "username email")
      .lean();
    res.status(200).json(populatedDiscussion);
  } catch (error) {
    console.error("Error in handling toogle comment dislikes : ", error);
    res.status(500).json({ message: "problem in toogling comment dislike" });
  }
}

export {
  getProblemDiscussions,
  addProblemDiscussion,
  addComment,
  toggleDiscussionLike,
  toggleDiscussionDislike,
  toggleCommentLike,
  toggleCommentDislike,
};
