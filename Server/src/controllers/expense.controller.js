import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Expense } from "../models/expense.model.js";
import { User } from "../models/user.model.js";
import { convertCurrency } from "../services/currency.service.js";
import { extractReceiptData } from "../services/ocr.service.js";
import { submitExpenseForApproval } from "../services/approval.service.js";
import { sendEmail } from "../utils/sendEmail.js";
import { templates } from "../services/emailTemplates.js";
import { getId } from "../utils/ids.js";

const receiptFromFile = (file) =>
  file
    ? {
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
      }
    : undefined;

const populateExpense = (query) =>
  query
    .populate("employeeId", "name email")
    .populate("companyId", "name currency country")
    .populate("managerId", "name email")
    .populate("currentApproverId", "name email role")
    .populate("approvalSteps.approverId", "name email role");

const getEmployee = async (req) => {
  const employee = await User.findById(req.user._id).select("name email role companyId managerId");
  if (!employee || employee.role !== "Employee") {
    throw new ApiError(403, "Only employees can manage expense submissions");
  }
  if (!employee.companyId) {
    throw new ApiError(400, "Employee is not linked to a company");
  }
  return employee;
};

const createExpense = asyncHandler(async (req, res) => {
  const employee = await getEmployee(req);
  const payload = req.body;
  const companyCurrency = req.user.companyId?.currency || "USD";

  const expense = await Expense.create({
    employeeId: req.user._id,
    managerId: employee.managerId || null,
    companyId: employee.companyId,
    description: payload.description,
    date: payload.date,
    amount: payload.amount,
    currency: payload.currency,
    convertedCurrency: companyCurrency,
    category: payload.category,
    remarks: payload.remarks,
    paidBy: req.user.name,
    status: "Draft",
    receipt: receiptFromFile(req.file) || payload.receipt,
    ocr: payload.ocr,
  });

  return res.status(201).json(new ApiResponse(201, expense, "Expense draft created successfully"));
});

const getEmployeeExpenses = asyncHandler(async (req, res) => {
  const expenses = await populateExpense(Expense.find({ employeeId: req.user._id })).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await populateExpense(Expense.findById(req.params.id));
  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  const companyId = getId(req.user.companyId);
  const canAccess =
    req.user.role === "Admin"
      ? getId(expense.companyId) === companyId
      : req.user.role === "Employee"
        ? getId(expense.employeeId) === getId(req.user._id)
        : expense.approvalSteps.some((step) => getId(step.approverId) === getId(req.user._id)) ||
          getId(expense.managerId) === getId(req.user._id);

  if (!canAccess) {
    throw new ApiError(403, "You do not have access to this expense");
  }

  return res.status(200).json(new ApiResponse(200, expense, "Expense fetched successfully"));
});

const submitExpense = asyncHandler(async (req, res) => {
  const employee = await getEmployee(req);
  const expense = await Expense.findOne({ _id: req.params.id, employeeId: req.user._id });

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  const companyCurrency = req.user.companyId?.currency || "USD";
  const conversion = await convertCurrency({
    amount: expense.amount,
    from: expense.currency,
    to: companyCurrency,
  });
  Object.assign(expense, conversion);

  const submitted = await submitExpenseForApproval({ expense, employee, actor: req.user });
  await submitted.populate("currentApproverId", "name email role");

  const employeeEmail = templates.expenseSubmitted({
    employeeName: req.user.name,
    description: submitted.description,
    amount: `${submitted.convertedAmount} ${submitted.convertedCurrency}`,
  });
  await sendEmail({ to: req.user.email, ...employeeEmail });

  if (submitted.currentApproverId?.email) {
    const assignedEmail = templates.approvalAssigned({
      approverName: submitted.currentApproverId.name,
      employeeName: req.user.name,
      description: submitted.description,
      amount: `${submitted.convertedAmount} ${submitted.convertedCurrency}`,
    });
    await sendEmail({ to: submitted.currentApproverId.email, ...assignedEmail });
  }

  return res.status(200).json(new ApiResponse(200, submitted, "Expense submitted for approval"));
});

const runReceiptOcr = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Receipt file is required");
  }

  const ocr = await extractReceiptData(req.file.path);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        receipt: receiptFromFile(req.file),
        ocr,
      },
      "Receipt scanned successfully"
    )
  );
});

export { createExpense, getEmployeeExpenses, getExpenseById, submitExpense, runReceiptOcr };
