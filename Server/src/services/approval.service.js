import { ApprovalRule } from "../models/approvalRule.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { getId, sameId } from "../utils/ids.js";

const sortSteps = (steps = []) => [...steps].sort((a, b) => a.sequence - b.sequence);

export const getDefaultApprovalRule = (companyId) => ({
  companyId,
  managerFirst: true,
  ruleType: "percentage",
  minimumPercentage: 100,
  specificApproverId: null,
  approvers: [],
  isActive: true,
});

export const getApprovalRuleForCompany = async (companyId) => {
  const rule = await ApprovalRule.findOne({ companyId }).populate("approvers.userId", "name email role");
  return rule || getDefaultApprovalRule(companyId);
};

export const buildApprovalSteps = async ({ employee, companyId }) => {
  const rule = await getApprovalRuleForCompany(companyId);
  const steps = [];
  let sequence = 1;

  if (rule.isActive && rule.managerFirst && employee.managerId) {
    const manager = await User.findOne({
      _id: employee.managerId,
      companyId,
      role: "Manager",
      isActive: { $ne: false },
    }).select("name role email");

    if (manager) {
      steps.push({
        approverId: manager._id,
        approverName: manager.name,
        approverRole: manager.role,
        type: "Manager",
        sequence: sequence++,
        required: true,
        status: "Pending",
      });
    }
  }

  const seen = new Set(steps.map((step) => getId(step.approverId)));
  const configuredApprovers = sortSteps(rule.approvers || []);

  for (const approverConfig of configuredApprovers) {
    const approverId = getId(approverConfig.userId);
    if (!approverId || seen.has(approverId)) continue;

    const approver = approverConfig.userId?.name
      ? approverConfig.userId
      : await User.findOne({
          _id: approverConfig.userId,
          companyId,
          role: { $in: ["Admin", "Manager"] },
          isActive: { $ne: false },
        }).select("name role email");

    if (!approver) continue;

    seen.add(approverId);
    steps.push({
      approverId: approver._id,
      approverName: approver.name,
      approverRole: approver.role,
      type: "Approver",
      sequence: sequence++,
      required: Boolean(approverConfig.required),
      status: "Pending",
    });
  }

  return { steps, rule };
};

const hasSpecificApproverApproved = (steps, specificApproverId) => {
  if (!specificApproverId) return false;
  return steps.some((step) => sameId(step.approverId, specificApproverId) && step.status === "Approved");
};

const hasReachedPercentage = (steps, minimumPercentage = 100) => {
  if (!steps.length) return true;
  const approved = steps.filter((step) => step.status === "Approved").length;
  return (approved / steps.length) * 100 >= minimumPercentage;
};

const requiredStepsCleared = (steps) =>
  steps.every((step) => !step.required || step.status === "Approved" || step.status === "Skipped");

export const evaluateApprovalState = ({ expense, rule }) => {
  const steps = sortSteps(expense.approvalSteps || []);

  if (!steps.length) {
    return { finalStatus: "Approved", currentApproverId: null, autoApproved: true };
  }

  if (steps.some((step) => step.status === "Rejected")) {
    return { finalStatus: "Rejected", currentApproverId: null, autoApproved: false };
  }

  const percentageReached = hasReachedPercentage(steps, rule?.minimumPercentage || 100);
  const specificReached = hasSpecificApproverApproved(steps, rule?.specificApproverId);
  const allRequiredApproved = requiredStepsCleared(steps);

  const ruleType = rule?.ruleType || "percentage";
  const ruleSatisfied =
    ruleType === "hybrid"
      ? percentageReached || specificReached
      : ruleType === "specific"
        ? specificReached
        : percentageReached;

  const allStepsResolved = steps.every((step) => step.status !== "Pending");

  if ((ruleSatisfied && allRequiredApproved) || allStepsResolved) {
    return { finalStatus: "Approved", currentApproverId: null, autoApproved: true };
  }

  const nextStep = steps.find((step) => step.status === "Pending");
  return {
    finalStatus: "Waiting approval",
    currentApproverId: nextStep?.approverId || null,
    autoApproved: false,
  };
};

export const submitExpenseForApproval = async ({ expense, employee, actor }) => {
  if (expense.status !== "Draft") {
    throw new ApiError(409, "Only draft expenses can be submitted");
  }

  const { steps, rule } = await buildApprovalSteps({
    employee,
    companyId: expense.companyId,
  });

  expense.approvalSteps = steps;
  expense.submittedAt = new Date();
  expense.status = steps.length ? "Waiting approval" : "Approved";
  expense.currentApproverId = steps[0]?.approverId || null;
  expense.approvalHistory.push({
    action: "Submitted",
    actorId: actor._id,
    actorName: actor.name,
    actorRole: actor.role,
    fromStatus: "Draft",
    toStatus: expense.status,
    comment: "Submitted for approval",
  });

  const evaluated = evaluateApprovalState({ expense, rule });
  expense.status = evaluated.finalStatus;
  expense.currentApproverId = evaluated.currentApproverId;

  if (evaluated.autoApproved && evaluated.finalStatus === "Approved" && !steps.length) {
    expense.approvalHistory.push({
      action: "Auto approved",
      actorId: actor._id,
      actorName: actor.name,
      actorRole: actor.role,
      fromStatus: "Waiting approval",
      toStatus: "Approved",
      comment: "No approval steps configured",
    });
  }

  await expense.save();
  return expense;
};

export const applyApprovalAction = async ({ expense, actor, action, comment }) => {
  if (expense.status !== "Waiting approval") {
    throw new ApiError(409, "Only expenses waiting for approval can be reviewed");
  }

  if (!sameId(expense.currentApproverId, actor._id)) {
    throw new ApiError(403, "This expense is not assigned to you for approval");
  }

  const step = expense.approvalSteps.find(
    (approvalStep) => sameId(approvalStep.approverId, actor._id) && approvalStep.status === "Pending"
  );

  if (!step) {
    throw new ApiError(404, "Approval step not found");
  }

  const fromStatus = expense.status;
  step.status = action;
  step.comment = comment;
  step.actedAt = new Date();

  const rule = await getApprovalRuleForCompany(expense.companyId);
  const evaluated = evaluateApprovalState({ expense, rule });

  expense.status = evaluated.finalStatus;
  expense.currentApproverId = evaluated.currentApproverId;
  expense.approvalHistory.push({
    action,
    actorId: actor._id,
    actorName: actor.name,
    actorRole: actor.role,
    comment,
    fromStatus,
    toStatus: expense.status,
  });

  if (evaluated.autoApproved && action === "Approved" && expense.status === "Approved") {
    expense.approvalHistory.push({
      action: "Auto approved",
      actorId: actor._id,
      actorName: actor.name,
      actorRole: actor.role,
      comment: "Approval rule satisfied",
      fromStatus,
      toStatus: "Approved",
    });
  }

  await expense.save();
  return expense;
};

export const applyAdminOverride = async ({ expense, actor, action, comment }) => {
  if (expense.status === "Draft") {
    throw new ApiError(409, "Draft expenses cannot be overridden");
  }

  const fromStatus = expense.status;
  expense.status = action;
  expense.currentApproverId = null;
  expense.adminOverride = {
    by: actor._id,
    action,
    comment,
    at: new Date(),
  };
  expense.approvalHistory.push({
    action: "Override",
    actorId: actor._id,
    actorName: actor.name,
    actorRole: actor.role,
    comment,
    fromStatus,
    toStatus: action,
  });

  await expense.save();
  return expense;
};
