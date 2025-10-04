import express from "express";
import { createUser,getAllManagers } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = express.Router();

// Only Admin can create new users
router.post("/createuser", verifyJWT, createUser);

// Fetch all managers
router.get("/managers", verifyJWT, getAllManagers);

export default router;
