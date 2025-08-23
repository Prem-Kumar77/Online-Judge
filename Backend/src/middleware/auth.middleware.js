import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

async function protectRoute(req, res, next) {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.headers.cookie) {
      const allTokens = req.headers.cookie
        .split(";")
        .map((c) => c.trim())
        .filter((c) => c.startsWith("token="))
        .map((c) => c.replace("token=", ""));

      if (allTokens.length > 0) {
        token = allTokens[allTokens.length - 1];
      }
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized - Token Expired" });
    }
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export { protectRoute, validate, isLoggedIn };
