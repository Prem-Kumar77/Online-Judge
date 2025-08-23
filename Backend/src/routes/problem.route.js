import { Router } from "express";
import {
  getAllProblems,
  getProblemById,
  toggleLikeProblem,
  toggleDislikeProblem,
} from "../controllers/problem.controller.js";
import { protectRoute, isLoggedIn } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getAllProblems);
router.get("/:id", getProblemById);
router.post("/:id/like", protectRoute, isLoggedIn, toggleLikeProblem);
router.post("/:id/dislike", protectRoute, isLoggedIn, toggleDislikeProblem);

export default router;
