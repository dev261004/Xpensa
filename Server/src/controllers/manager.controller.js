import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Expense } from "../models/expense.model.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import axios from "axios";

const getManagerPendingExpenses = asyncHandler(async (req, res) => {
  // 1️⃣ Find all employees under this manager
  const employees = await User.find({ managerId: req.user._id }).select("_id name email");
  const employeeIds = employees.map((emp) => emp._id);

  if (employeeIds.length === 0) {
    return res.status(200).json({
      status: "success",
      message: "No employees assigned to this manager",
      data: [],
    });
  }

  // 2️⃣ Find only those employees who have 'Processing' expenses
  const expenses = await Expense.find({
    employeeId: { $in: employeeIds },
    status: "Processing",
  })
    .populate("employeeId", "name email managerId")
    .sort({ createdAt: -1 });

  // 3️⃣ Get list of employees who have at least one expense
  const employeesWithExpenses = employees.filter((emp) =>
    expenses.some((exp) => String(exp.employeeId._id) === String(emp._id))
  );

  // 4️⃣ Convert currency if needed
  const companyCurrency = req.user.companyId?.currency || "USD";
  const convertedExpenses = await Promise.all(
    expenses.map(async (expense) => {
    //   let convertedAmount = expense.amount;
    //  // console.log("expense.currency",expense.currency);
    //   if (expense.currency !== companyCurrency) {
    //     try {
    //       const response = await axios.get(
    //         `https://api.exchangerate-api.com/v4/latest/${companyCurrency}`
    //       );
          
    //        const rates = response.data.rates;
    //      // console.log("rate of ${expense.currency} ",rates);
    //       convertedAmount = expense.amount * (rates[expense.currency] || 1);
    //     } catch (err) {
    //       console.error("Currency conversion failed", err.message);
    //     }
    //   }
    // --- inside expenses.map(async expense => { ... })
let convertedAmount = Number(expense.amount); // keep same units as expense.amount

if (expense.currency && companyCurrency && expense.currency !== companyCurrency) {
  try {
    // Use expense.currency as API base and multiply by rate->companyCurrency
    const url = `https://api.exchangerate-api.com/v4/latest/${encodeURIComponent(expense.currency)}`;
    const response = await axios.get(url, { timeout: 5000 });
    const rates = response.data?.rates || {};
    const rate = rates[companyCurrency];

    if (rate && !isNaN(rate)) {
      // expense.amount is major units -> multiply, then round to 2 decimals
      convertedAmount = Number((Number(expense.amount) * Number(rate)).toFixed(2));
    } else {
      console.warn(`Conversion rate for ${expense.currency} -> ${companyCurrency} not found`, rates);
      // keep convertedAmount as original amount (fallback)
    }
  } catch (err) {
    console.error("Currency conversion failed", err.message);
    // fallback: keep convertedAmount = expense.amount
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
        employee: {
          id: expense.employeeId._id,
          name: expense.employeeId.name,
          email: expense.employeeId.email,
        },
      };
    })
  );

  // 5️⃣ Send filtered result
  return res.status(200).json({
    status: "success",
    message: "Pending expenses fetched successfully",
    employeesWithExpenses,
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
  const employee = await User.findById(expense.employeeId);
  if (!employee || String(employee.managerId) !== String(req.user._id)) {
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

const getManagerCompany = asyncHandler(async (req, res) => {
  if (!req.user.companyId) {
    throw new ApiError(404, "Manager has no associated company");
  }

  const company = await Company.findById(req.user.companyId);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }

  return res.status(200).json({
    status: "success",
    data: {
      name: company.name,
      currency: company.currency,
    },
  });
});

export { getManagerPendingExpenses, updateExpenseStatus, getManagerCompany  };
