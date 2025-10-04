import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

// Generate random temporary password
const generateRandomPassword = (length = 10) => {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
};

// Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const tempPassword = generateRandomPassword(8);
  user.password = tempPassword;
  user.tempPassword = true; // mark as temporary
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: email,
    subject: "Your Temporary Password",
    text: `Hello ${user.name},\n\nYour temporary password is: ${tempPassword}\nPlease login and change your password immediately.`,
  });

  return res.status(200).json({
    status: "success",
    message: "Temporary password sent to your email",
  });
});


// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
  const { email, tempPassword, newPassword } = req.body;

  if (!email || !tempPassword || !newPassword) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const isValid = await user.isPasswordCorrect(tempPassword);
  if (!isValid) throw new ApiError(401, "Invalid temporary password");

  user.password = newPassword;
  user.tempPassword = false; // reset temporary flag
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({
    status: "success",
    message: "Password changed successfully",
  });
});


export { forgotPassword, resetPassword };
