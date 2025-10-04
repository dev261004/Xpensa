import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Expense } from "../models/expense.model.js";
import { User } from "../models/user.model.js";
import axios from "axios";

const getManagerPendingExpenses = asyncHandler(async (req, res) => {
  // 1. Find all employees who report to this manager
  const employees = await User.find({ managerId: req.user._id }).select("_id name");

  const employeeIds = employees.map((emp) => emp._id);

  // 2. Find all expenses with status Processing submitted by these employees
  const expenses = await Expense.find({
    employeeId: { $in: employeeIds },
    status: "Processing",
  }).populate("employeeId", "name email");

  // 3. Get company's base currency from logged-in manager
  const companyCurrency = req.user.companyId?.currency || "USD"; // fallback to USD

  // 4. Convert employee amount to company base currency if needed
  const convertedExpenses = await Promise.all(
    expenses.map(async (expense) => {
      let convertedAmount = expense.amount;

      if (expense.currency !== companyCurrency) {
        try {
          const response = await axios.get(
            `https://api.exchangerate-api.com/v4/latest/${expense.currency}`
          );
          const rates = response.data.rates;
          convertedAmount = expense.amount / rates[companyCurrency]; // convert to base
        } catch (err) {
          console.error("Currency conversion failed", err.message);
        }
      }

      return {
        _id: expense._id,
        description: expense.description,
        remarks: expense.remarks,
        date: expense.date,
        paidBy: expense.paidBy,
        category: expense.category,
        amount: expense.amount,
        currency: expense.currency,
        convertedAmount,
        status: expense.status,
        employee: expense.employeeId.name,
      };
    })
  );

  return res.status(200).json({
    status: "success",
    data: convertedExpenses,
  });
});

const updateExpenseStatus = asyncHandler(async (req, res) => {
  const { expenseId, action, remarks } = req.body;

  if (!["Approved", "Rejected"].includes(action)) {
    throw new ApiError(400, "Invalid action, must be Approved or Rejected");
  }

  const expense = await Expense.findById(expenseId);

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  // Check if manager is authorized
  if (String(expense.managerId) !== String(req.user._id)) {
    throw new ApiError(403, "You are not authorized to approve/reject this expense");
  }

  expense.status = action;
  expense.remarks = remarks || expense.remarks;

  await expense.save();

  return res.status(200).json({
    status: "success",
    message: `Expense ${action.toLowerCase()} successfully`,
    data: expense,
  });
});



export { getManagerPendingExpenses,updateExpenseStatus };
