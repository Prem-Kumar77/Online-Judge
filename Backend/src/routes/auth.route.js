import { Router } from "express";
import {
  signup,
  login,
  logout,
  refresh,
} from "../controllers/auth.controller.js";
import {
  signupValidator,
  loginValidator,
} from "../middleware/validators/auth.validator.js";
import { validate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signupValidator, validate, signup);
router.post("/login", loginValidator, validate, login);
router.post("/logout", logout);
router.post("/refresh", refresh);

export default router;
