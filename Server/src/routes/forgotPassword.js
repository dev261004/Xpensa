import { Router } from "express";
import { forgotPassword, resetPassword } from "../controllers/forgotPassword.controller.js";
import { validate } from "../middlewares/validate.js";
import { forgotPasswordSchema, resetPasswordSchema } from "../validators/user.schemas.js";

const router = Router();

router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
