import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Expense } from "../models/expense.model.js";
import { User } from "../models/user.model.js";
import { applyApprovalAction } from "../services/approval.service.js";
import { sendEmail } from "../utils/sendEmail.js";
import { templates } from "../services/emailTemplates.js";
import { getId } from "../utils/ids.js";

const populateApproval = (query) =>
  query
    .populate("employeeId", "name email")
    .populate("companyId", "name currency")
    .populate("currentApproverId", "name email role")
    .populate("approvalSteps.approverId", "name email role")
    .sort({ submittedAt: 1, createdAt: -1 });

const getManagerApprovals = asyncHandler(async (req, res) => {
  const approvals = await populateApproval(
    Expense.find({
      companyId: getId(req.user.companyId),
      currentApproverId: req.user._id,
      status: "Waiting approval",
    })
  );

  const teamExpenses = await Expense.find({
    companyId: getId(req.user.companyId),
    managerId: req.user._id,
  })
    .populate("employeeId", "name email")
    .sort({ createdAt: -1 })
    .limit(20);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        approvals,
        teamExpenses,
        company: {
          name: req.user.companyId?.name,
          currency: req.user.companyId?.currency,
        },
      },
      "Manager approvals fetched successfully"
    )
  );
});

const updateExpenseStatus = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({
    _id: req.params.id,
    companyId: getId(req.user.companyId),
  }).populate("employeeId", "name email");

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  const updated = await applyApprovalAction({
    expense,
    actor: req.user,
    action: req.body.action,
    comment: req.body.comment,
  });

  if (updated.status === "Approved" || updated.status === "Rejected") {
    const emailContent = templates.expenseOutcome({
      employeeName: expense.employeeId?.name || "Employee",
      description: updated.description,
      status: updated.status,
      comment: req.body.comment,
    });
    await sendEmail({ to: expense.employeeId.email, ...emailContent });
  } else if (updated.currentApproverId) {
    const nextApprover = await User.findById(updated.currentApproverId).select("name email");
    if (nextApprover) {
      const emailContent = templates.approvalAssigned({
        approverName: nextApprover.name,
        employeeName: expense.employeeId?.name || "Employee",
        description: updated.description,
        amount: `${updated.convertedAmount} ${updated.convertedCurrency}`,
      });
      await sendEmail({ to: nextApprover.email, ...emailContent });
    }
  }

  await updated.populate("approvalSteps.approverId", "name email role");
  await updated.populate("currentApproverId", "name email role");

  return res.status(200).json(new ApiResponse(200, updated, `Expense ${req.body.action.toLowerCase()} successfully`));
});

const getManagerCompany = asyncHandler(async (req, res) => {
  if (!req.user.companyId) {
    throw new ApiError(404, "Manager has no associated company");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        name: req.user.companyId.name,
        currency: req.user.companyId.currency,
      },
      "Company fetched successfully"
    )
  );
});

export { getManagerApprovals, updateExpenseStatus, getManagerCompany };
