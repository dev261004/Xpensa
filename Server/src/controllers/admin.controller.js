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
   console.log("user :",req.user);
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

  // 4️⃣ Get companyId from the logged-in Admin
  const companyId = req.user?.companyId;
  if (!companyId) {
    throw new ApiError(400, "Admin's companyId not found. Please ensure Admin is linked to a company.");
  }

  // 5️⃣ Generate temporary password
  const tempPassword = generateRandomPassword();

  // 6️⃣ Create user and attach same companyId as admin
  const newUser = await User.create({
    name,
    email,
    role,
    managerId: role === "Employee" ? managerId : null,
    password: tempPassword,
    tempPassword: true,
    companyId, // ✅ Added automatically from Admin
  });

  // 7️⃣ Send email with credentials
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

  // 8️⃣ Respond to Admin
  return res.status(201).json({
    status: "success",
    message: "User created and credentials sent via email",
    user: {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      managerId: newUser.managerId,
      companyId: newUser.companyId, // optional to include
    },
  });
});


// Get all users with manager details
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .populate("managerId", "name email") // populate manager details
    .select("name email role managerId");

  const formattedUsers = users.map(user => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    manager: user.managerId ? user.managerId.name : null, // show manager name if exists
    managerEmail: user.managerId ? user.managerId.email : null,
  }));

  return res.status(200).json({
    status: "success",
    data: formattedUsers,
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

export { createUser, getAllUsers,getAllManagers };



