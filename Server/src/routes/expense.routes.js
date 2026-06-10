import express from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { createExpense, getEmployeeExpenses,updateExpenseStatus } from "../controllers/expense.controller.js";

const router = express.Router();

// Employee actions
router.post("/", verifyJWT, createExpense); // Create new expense
router.get("/", verifyJWT, getEmployeeExpenses); // Get all expenses for employee
router.patch("/:id/status", verifyJWT, updateExpenseStatus);

export default router;
