import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Expense } from "../models/expense.model.js";
import { User } from "../models/user.model.js"; // ✅ import User model to fetch managerId

/**
 * @desc Create a new expense (Employee)
 */
const createExpense = asyncHandler(async (req, res) => {
  const { description, date, amount, currency, category, remarks } = req.body;

  if (!description || !date || !amount || !currency || !category) {
    throw new ApiError(400, "All fields except remarks are required");
  }

  // ✅ Get the logged-in employee details (to extract managerId)
  const employee = await User.findById(req.user._id).select("managerId name companyId");

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  if (!employee.companyId) {
    throw new ApiError(400, "Employee is not linked to a company");
  }

  // ✅ Create expense with linked manager and company
  const expense = await Expense.create({
    employeeId: req.user._id,
    managerId: employee.managerId || null, // 🔥 store managerId directly
    companyId: employee.companyId,
    description,
    date,
    amount,
    currency,
    category,
    remarks,
    paidBy: req.user.name,
    status: "Processing", // default status
  });

  return res.status(201).json({
    status: "success",
    message: "Expense submitted successfully",
    data: expense,
  });
});

/**
 * @desc Get all expenses for logged-in employee
 */
const getEmployeeExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ employeeId: req.user._id })
    .sort({ createdAt: -1 })
    .populate("managerId", "name email") // optional: show manager info
    .populate("companyId", "name currency");

  return res.status(200).json({
    status: "success",
    data: expenses,
  });
});

/**
 * @desc Get all expenses for logged-in manager
 */
const getManagerExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ managerId: req.user._id })
    .sort({ createdAt: -1 })
    .populate("employeeId", "name email")
    .populate("companyId", "name currency");

  return res.status(200).json({
    status: "success",
    data: expenses,
  });
});


const updateExpenseStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Waiting approval", "Approved", "Rejected"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const expense = await Expense.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!expense) throw new ApiError(404, "Expense not found");

  res.status(200).json({
    status: "success",
    message: `Expense marked as ${status}`,
    data: expense,
  });
});

export { createExpense, getEmployeeExpenses, getManagerExpenses ,updateExpenseStatus};
