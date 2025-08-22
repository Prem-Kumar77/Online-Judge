import User from "../models/user.model.js";

function getUserProfile(req, res) {
  // Get user profile logic
  const { _id, username, email, role, profilePicture } = req.user;
  res
    .status(200)
    .json({ user: { _id, username, email, role, profilePicture } });
}

async function updateProfile(req, res) {
  // Update profile logic
  try {
    const { username, email, profilePicture } = req.body;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, profilePicture },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    console.log("Error in update profile controller: " + error);
    return res
      .status(500)
      .json({ message: "Error in update profile controller" });
  }
}

export { getUserProfile, updateProfile };
