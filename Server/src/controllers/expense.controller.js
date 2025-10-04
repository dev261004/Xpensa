import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Expense } from "../models/expense.model.js";

const createExpense = asyncHandler(async (req, res) => {
  const { description, date, amount, currency, category, remarks } = req.body;

  if (!description || !date || !amount || !currency || !category) {
    throw new ApiError(400, "All fields except remarks are required");
  }

  const expense = await Expense.create({
    employeeId: req.user._id,
    companyId: req.user.companyId,
    description,
    date,
    amount,
    currency,
    category,
    remarks,
    paidBy: req.user.name,
    status: "Processing", // auto set to Processing on submit
  });

  return res.status(201).json({
    status: "success",
    message: "Expense submitted successfully",
    data: expense,
  });
});

const getEmployeeExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ employeeId: req.user._id }).sort({
    createdAt: -1,
  });

  return res.status(200).json({
    status: "success",
    data: expenses,
  });
});

export {createExpense,getEmployeeExpenses}