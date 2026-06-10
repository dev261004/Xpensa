import express from "express";
import { getManagerApprovals, updateExpenseStatus, getManagerCompany } from "../controllers/manager.controller.js";
import { verifyJWT } from "../middlewares/auth.js";
import { requireCompany, requireRole } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { expenseActionSchema } from "../validators/expense.schemas.js";

const router = express.Router();

router.use(verifyJWT, requireRole("Manager", "Admin"), requireCompany);

router.get("/approvals", getManagerApprovals);
router.post("/approvals/:id/action", validate(expenseActionSchema), updateExpenseStatus);
router.get("/company", getManagerCompany);

router.get("/", getManagerApprovals);

export default router;
