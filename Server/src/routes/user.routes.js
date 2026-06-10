import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../validators/user.schemas.js";

const router = Router();

router.route("/register").post(validate(registerSchema), registerUser);
router.route("/login").post(validate(loginSchema), loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/update-account").put(verifyJWT, updateAccountDetails);

export default router;
