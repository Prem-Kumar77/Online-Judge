import { Router } from "express";
import {
  protectRoute,
  isAdmin,
  validate,
} from "../middleware/auth.middleware.js";
import {
  getAllContests,
  getContestById,
  joinContest,
  submitSolution,
  getContestLeaderboard,
  createContest,
  updateContest,
  deleteContest,
} from "../controllers/contest.controller.js";

import {
  contestCreationValidator,
  contestUpdateValidator,
  submitCodeValidator,
} from "../middleware/validators/contest.validator.js";

const router = Router();

// User routes
router.get("/", protectRoute, getAllContests);
router.get("/:id", protectRoute, getContestById);
router.post("/:id/join", protectRoute, joinContest);
router.post(
  "/:id/problems/:problemId/submit",
  protectRoute,
  submitCodeValidator,
  validate,
  submitSolution
);
router.get("/:id/leaderboard", protectRoute, getContestLeaderboard);

// Admin routes
router.post(
  "/",
  protectRoute,
  isAdmin,
  contestCreationValidator,
  validate,
  createContest
);
router.put(
  "/:id",
  protectRoute,
  isAdmin,
  contestUpdateValidator,
  validate,
  updateContest
);
router.delete("/:id", protectRoute, isAdmin, deleteContest);

export default router;
