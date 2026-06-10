import express from "express";
import {
  createUser,
  deleteUser,
  getAllExpenses,
  getAllManagers,
  getAllUsers,
  getApprovalRule,
  overrideExpense,
  updateApprovalRule,
  updateUser,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.js";
import { requireCompany, requireRole } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { approvalRuleSchema } from "../validators/approval.schemas.js";
import {
  adminOverrideSchema,
} from "../validators/expense.schemas.js";
import {
  createAdminUserSchema,
  deleteAdminUserSchema,
  updateAdminUserSchema,
} from "../validators/user.schemas.js";

const router = express.Router();

router.use(verifyJWT, requireRole("Admin"), requireCompany);

router.get("/users", getAllUsers);
router.post("/users", validate(createAdminUserSchema), createUser);
router.patch("/users/:id", validate(updateAdminUserSchema), updateUser);
router.delete("/users/:id", validate(deleteAdminUserSchema), deleteUser);
router.post("/createuser", validate(createAdminUserSchema), createUser);
router.get("/managers", getAllManagers);

router.get("/approval-rule", getApprovalRule);
router.put("/approval-rule", validate(approvalRuleSchema), updateApprovalRule);

router.get("/expenses", getAllExpenses);
router.post("/expenses/:id/override", validate(adminOverrideSchema), overrideExpense);

export default router;
