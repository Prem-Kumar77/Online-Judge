import { Router } from "express";
import {
  allSubmissionsByUser,
  problemSubmissionsByUser,
  getSubmissionById,
  createSubmission,
} from "../controllers/submission.controller.js";
import { isLoggedIn, protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/user/:userId", protectRoute, isLoggedIn, allSubmissionsByUser);
router.get(
  "/problem/:problemId",
  protectRoute,
  isLoggedIn,
  problemSubmissionsByUser
);
router.get("/submission/:submissionId", getSubmissionById);
router.post("/problem/:problemId", protectRoute, isLoggedIn, createSubmission);

export default router;
