import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Company } from "../models/company.model.js";
import { getCurrencyForCountry } from "../services/countries.service.js";

const cookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
  };
};

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  managerId: user.managerId,
  tempPassword: user.tempPassword,
  companyId: user.companyId,
});

const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, country, companyName } = req.body;

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "User with email already exists");
  }

  const currency = await getCurrencyForCountry(country);
  const company = await Company.create({
    name: companyName || `${name}'s Company`,
    country,
    currency,
  });

  const user = await User.create({
    name,
    email,
    password,
    role: "Admin",
    companyId: company._id,
  });

  company.createdBy = user._id;
  await company.save();

  const createdUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .populate("companyId", "name country currency settings");

  return res
    .status(201)
    .json(new ApiResponse(201, { user: serializeUser(createdUser) }, "Admin and company created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).populate("companyId", "name country currency settings");
  if (!user || user.isActive === false) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions())
    .cookie("refreshToken", refreshToken, cookieOptions())
    .json(
      new ApiResponse(
        200,
        {
          user: serializeUser(user),
          accessToken,
          refreshToken,
          tempPassword: Boolean(user.tempPassword),
        },
        user.tempPassword ? "Login successful. Please change your temporary password." : "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions())
    .clearCookie("refreshToken", cookieOptions())
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decodedToken?._id);

  if (!user || incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh token is expired or invalid");
  }

  const tokens = await generateAccessAndRefreshTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", tokens.accessToken, cookieOptions())
    .cookie("refreshToken", tokens.refreshToken, cookieOptions())
    .json(new ApiResponse(200, tokens, "Access token refreshed"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  user.tempPassword = false;
  await user.save();

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, serializeUser(req.user), "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name && !email) {
    throw new ApiError(400, "Name or email is required");
  }

  const user = await User.findByIdAndUpdate(req.user?._id, { $set: { name, email } }, { new: true }).select(
    "-password -refreshToken"
  );

  return res.status(200).json(new ApiResponse(200, serializeUser(user), "Account details updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
};
