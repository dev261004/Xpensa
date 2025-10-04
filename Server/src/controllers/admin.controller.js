import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

// Generate random temporary password
const generateRandomPassword = (length = 8) => {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
};

const createUser = asyncHandler(async (req, res) => {
  const { name, email, role, managerId } = req.body;

  // 1️⃣ Validate input
  if (!name || !email || !role) {
    throw new ApiError(400, "Name, email, and role are required");
  }

  if (!["Manager", "Employee"].includes(role)) {
    throw new ApiError(400, "Invalid role. Must be 'Manager' or 'Employee'");
  }

  // 2️⃣ If role is Employee, managerId must be provided
  if (role === "Employee" && !managerId) {
    throw new ApiError(400, "Employee must have a manager assigned");
  }

  // 3️⃣ Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // 4️⃣ Generate temporary password
  const tempPassword = generateRandomPassword();

  // 5️⃣ Create user
  const newUser = await User.create({
    name,
    email,
    role,
    managerId: role === "Employee" ? managerId : null,
    password: tempPassword,
    tempPassword: true, // marks that password is temporary
  });

  // 6️⃣ Send email with credentials
  await sendEmail({
    to: email,
    subject: "Your Login Credentials",
    text: `Hello ${name},

Your account has been created with the following credentials:

Email: ${email}
Password: ${tempPassword}

Please login and change your password immediately.
`,
  });

  // 7️⃣ Respond to Admin
  return res.status(201).json({
    status: "success",
    message: "User created and credentials sent via email",
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      managerId: newUser.managerId,
    },
  });
});

// Fetch all users with role = Manager
const getAllManagers = asyncHandler(async (req, res) => {
  const managers = await User.find({ role: "Manager" }).select(
    "_id name email"
  );

  return res.status(200).json({
    status: "success",
    data: managers,
  });
});

export { createUser, getAllManagers };



