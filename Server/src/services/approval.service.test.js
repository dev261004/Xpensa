import { describe, expect, it } from "vitest";
import { evaluateApprovalState } from "./approval.service.js";

const ids = {
  first: "64f000000000000000000001",
  second: "64f000000000000000000002",
  cfo: "64f000000000000000000003",
};

const step = (approverId, status = "Pending", required = false) => ({
  approverId,
  status,
  required,
  sequence: 1,
});

describe("evaluateApprovalState", () => {
  it("auto-approves when no approval steps are configured", () => {
    const result = evaluateApprovalState({
      expense: { approvalSteps: [] },
      rule: { ruleType: "percentage", minimumPercentage: 100 },
    });

    expect(result).toEqual({
      finalStatus: "Approved",
      currentApproverId: null,
      autoApproved: true,
    });
  });

  it("keeps the next pending approver when the percentage rule is not satisfied", () => {
    const result = evaluateApprovalState({
      expense: { approvalSteps: [step(ids.first, "Approved"), step(ids.second, "Pending")] },
      rule: { ruleType: "percentage", minimumPercentage: 100 },
    });

    expect(result.finalStatus).toBe("Waiting approval");
    expect(result.currentApproverId).toBe(ids.second);
    expect(result.autoApproved).toBe(false);
  });

  it("approves when percentage rule is satisfied", () => {
    const result = evaluateApprovalState({
      expense: { approvalSteps: [step(ids.first, "Approved"), step(ids.second, "Pending")] },
      rule: { ruleType: "percentage", minimumPercentage: 50 },
    });

    expect(result.finalStatus).toBe("Approved");
    expect(result.currentApproverId).toBeNull();
    expect(result.autoApproved).toBe(true);
  });

  it("approves when specific approver rule is satisfied", () => {
    const result = evaluateApprovalState({
      expense: { approvalSteps: [step(ids.first, "Pending"), step(ids.cfo, "Approved")] },
      rule: { ruleType: "specific", minimumPercentage: 100, specificApproverId: ids.cfo },
    });

    expect(result.finalStatus).toBe("Approved");
  });

  it("rejects immediately when any approver rejects", () => {
    const result = evaluateApprovalState({
      expense: { approvalSteps: [step(ids.first, "Rejected"), step(ids.second, "Pending")] },
      rule: { ruleType: "hybrid", minimumPercentage: 50, specificApproverId: ids.cfo },
    });

    expect(result.finalStatus).toBe("Rejected");
    expect(result.currentApproverId).toBeNull();
  });
});
