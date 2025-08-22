import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateToken from "../lib/utils.js";

async function signup(req, res) {
  try {
    const { username, email, password, profilePicture } = req.body;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      profilePicture,
    });

    const { token } = generateToken(newUser, res);

    res.status(201).json({
      message: "User Created Successfully",
      user: {
        id: newUser._id,
        username,
        email,
        profilePicture,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in signing up", error: error.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  // Login logic

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const { token } = generateToken(user, res);
  res.status(200).json({
    message: "Login successful",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    token,
  });
}

function logout(req, res) {
  // Logout logic
  res.clearCookie("token", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
  res.status(200).json({ message: "Logout successful" });
}

async function refresh(req, res) {
  if (!req.cookies.refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = JWT.verify(
      req.cookies.refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = generateToken(user, res);
    res.status(200).json({ message: "Token refreshed successfully", token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in refreshing token", error: error.message });
  }
}

export { signup, login, logout, refresh };
