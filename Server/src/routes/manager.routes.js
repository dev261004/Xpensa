import express from "express";
import { verifyJWT } from "../middlewares/auth.js";
import { getManagerPendingExpenses, updateExpenseStatus } from "../controllers/manager.controller.js";

const router = express.Router();

// Manager dashboard endpoints
router.get("/", verifyJWT, getManagerPendingExpenses); // fetch pending expenses
router.post("/action", verifyJWT, updateExpenseStatus); // approve/reject expense

export default router;
