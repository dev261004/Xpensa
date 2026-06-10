import express from "express";
import {
  createExpense,
  getEmployeeExpenses,
  getExpenseById,
  runReceiptOcr,
  submitExpense,
} from "../controllers/expense.controller.js";
import { verifyJWT } from "../middlewares/auth.js";
import { requireCompany, requireRole } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { receiptUpload } from "../middlewares/upload.js";
import { createExpenseSchema, expenseIdParamSchema } from "../validators/expense.schemas.js";

const router = express.Router();

router.use(verifyJWT, requireCompany);

router.post("/ocr", requireRole("Employee"), receiptUpload.single("receipt"), runReceiptOcr);
router.post("/", requireRole("Employee"), receiptUpload.single("receipt"), validate(createExpenseSchema), createExpense);
router.get("/", requireRole("Employee"), getEmployeeExpenses);
router.get("/:id", validate(expenseIdParamSchema), getExpenseById);
router.post("/:id/submit", requireRole("Employee"), validate(expenseIdParamSchema), submitExpense);

export default router;
