import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { templates } from "../services/emailTemplates.js";

const generateRandomPassword = (length = 10) => crypto.randomBytes(length).toString("hex").slice(0, length);

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email, isActive: { $ne: false } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const tempPassword = generateRandomPassword(10);
  user.password = tempPassword;
  user.tempPassword = true;
  await user.save();

  const emailContent = templates.temporaryPassword({ name: user.name, password: tempPassword });
  await sendEmail({ to: user.email, ...emailContent });

  return res.status(200).json({
    status: "success",
    success: true,
    message: "Temporary password sent to your email",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, tempPassword, newPassword } = req.body;

  const user = await User.findOne({ email, isActive: { $ne: false } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValid = await user.isPasswordCorrect(tempPassword);
  if (!isValid) {
    throw new ApiError(401, "Invalid temporary password");
  }

  user.password = newPassword;
  user.tempPassword = false;
  await user.save();

  return res.status(200).json({
    status: "success",
    success: true,
    message: "Password changed successfully",
  });
});

export { forgotPassword, resetPassword };
