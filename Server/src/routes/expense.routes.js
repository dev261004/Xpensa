import express from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { createExpense, getEmployeeExpenses } from "../controllers/expense.controller.js";

const router = express.Router();

// Employee actions
router.post("/", verifyJWT, createExpense); // Create new expense
router.get("/", verifyJWT, getEmployeeExpenses); // Get all expenses for employee

export default router;
