import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Expense } from "../models/expense.model.js";
import { ApprovalRule } from "../models/approvalRule.model.js";
import { getApprovalRuleForCompany, applyAdminOverride } from "../services/approval.service.js";
import { sendEmail } from "../utils/sendEmail.js";
import { templates } from "../services/emailTemplates.js";
import { getId } from "../utils/ids.js";

const generateRandomPassword = (length = 10) => crypto.randomBytes(length).toString("hex").slice(0, length);

const companyFilter = (req) => ({ companyId: getId(req.user.companyId) });

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  managerId: user.managerId?._id || user.managerId || null,
  manager: user.managerId?.name || null,
  managerEmail: user.managerId?.email || null,
  isActive: user.isActive !== false,
});

const validateManager = async ({ companyId, managerId }) => {
  if (!managerId) return null;
  const manager = await User.findOne({
    _id: managerId,
    companyId,
    role: "Manager",
    isActive: { $ne: false },
  });
  if (!manager) {
    throw new ApiError(400, "Selected manager does not exist in this company");
  }
  return manager;
};

const createUser = asyncHandler(async (req, res) => {
  const { name, email, role, managerId } = req.body;
  const companyId = getId(req.user.companyId);

  if (role === "Employee") {
    await validateManager({ companyId, managerId });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const tempPassword = generateRandomPassword();
  const newUser = await User.create({
    name,
    email,
    role,
    managerId: role === "Employee" ? managerId : null,
    password: tempPassword,
    tempPassword: true,
    companyId,
  });

  const emailContent = templates.credentials({ name, email, password: tempPassword });
  await sendEmail({ to: email, ...emailContent });

  return res.status(201).json(new ApiResponse(201, serializeUser(newUser), "User created and credentials sent"));
});

const updateUser = asyncHandler(async (req, res) => {
  const companyId = getId(req.user.companyId);
  const target = await User.findOne({ _id: req.params.id, companyId, role: { $in: ["Employee", "Manager"] } });

  if (!target) {
    throw new ApiError(404, "User not found");
  }

  const updates = { ...req.body };

  if (updates.role === "Manager") {
    updates.managerId = null;
  }

  if ((updates.role || target.role) === "Employee") {
    await validateManager({ companyId, managerId: updates.managerId ?? target.managerId });
  }

  Object.assign(target, updates);
  await target.save();
  await target.populate("managerId", "name email");

  return res.status(200).json(new ApiResponse(200, serializeUser(target), "User updated successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const companyId = getId(req.user.companyId);
  const target = await User.findOne({ _id: req.params.id, companyId, role: { $in: ["Employee", "Manager"] } });

  if (!target) {
    throw new ApiError(404, "User not found");
  }

  target.isActive = false;
  await target.save();

  return res.status(200).json(new ApiResponse(200, serializeUser(target), "User deactivated successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ ...companyFilter(req), role: { $in: ["Employee", "Manager"] } })
    .populate("managerId", "name email")
    .select("name email role managerId isActive")
    .sort({ role: -1, name: 1 });

  return res.status(200).json(new ApiResponse(200, users.map(serializeUser), "Users fetched successfully"));
});

const getAllManagers = asyncHandler(async (req, res) => {
  const managers = await User.find({
    ...companyFilter(req),
    role: "Manager",
    isActive: { $ne: false },
  })
    .select("_id name email")
    .sort({ name: 1 });

  return res.status(200).json(new ApiResponse(200, managers, "Managers fetched successfully"));
});

const getApprovalRule = asyncHandler(async (req, res) => {
  const rule = await getApprovalRuleForCompany(getId(req.user.companyId));
  return res.status(200).json(new ApiResponse(200, rule, "Approval rule fetched successfully"));
});

const updateApprovalRule = asyncHandler(async (req, res) => {
  const companyId = getId(req.user.companyId);
  const body = req.body;

  const approverIds = [...new Set(body.approvers.map((item) => item.userId))];
  if (approverIds.length !== body.approvers.length) {
    throw new ApiError(400, "Approval rule cannot contain duplicate approvers");
  }

  if (approverIds.length) {
    const approverCount = await User.countDocuments({
      _id: { $in: approverIds },
      companyId,
      role: { $in: ["Admin", "Manager"] },
      isActive: { $ne: false },
    });
    if (approverCount !== approverIds.length) {
      throw new ApiError(400, "All approvers must be active Admin or Manager users in this company");
    }
  }

  if (body.specificApproverId) {
    const specificApprover = await User.findOne({
      _id: body.specificApproverId,
      companyId,
      role: { $in: ["Admin", "Manager"] },
      isActive: { $ne: false },
    });
    if (!specificApprover) {
      throw new ApiError(400, "Specific approver must be an active Admin or Manager in this company");
    }
  }

  const normalizedApprovers = body.approvers
    .map((approver, index) => ({
      userId: approver.userId,
      sequence: approver.sequence || index + 1,
      required: Boolean(approver.required),
    }))
    .sort((a, b) => a.sequence - b.sequence)
    .map((approver, index) => ({ ...approver, sequence: index + 1 }));

  const rule = await ApprovalRule.findOneAndUpdate(
    { companyId },
    { ...body, approvers: normalizedApprovers, companyId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate("approvers.userId", "name email role");

  return res.status(200).json(new ApiResponse(200, rule, "Approval rule saved successfully"));
});

const getAllExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find(companyFilter(req))
    .populate("employeeId", "name email")
    .populate("managerId", "name email")
    .populate("currentApproverId", "name email role")
    .populate("approvalSteps.approverId", "name email role")
    .sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

const overrideExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, ...companyFilter(req) }).populate(
    "employeeId",
    "name email"
  );

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  const updated = await applyAdminOverride({
    expense,
    actor: req.user,
    action: req.body.action,
    comment: req.body.comment,
  });

  const emailContent = templates.adminOverride({
    employeeName: expense.employeeId?.name || "Employee",
    description: expense.description,
    status: updated.status,
    comment: req.body.comment,
  });
  await sendEmail({ to: expense.employeeId.email, ...emailContent });

  return res.status(200).json(new ApiResponse(200, updated, "Expense override applied"));
});

export {
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getAllManagers,
  getApprovalRule,
  updateApprovalRule,
  getAllExpenses,
  overrideExpense,
};
