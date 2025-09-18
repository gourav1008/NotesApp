import express from "express";
const router = express.Router();

// Controllers
import { login, register, me } from "../controller/authController.js";
import { protect } from "../middleware/auth.js";
import { validateRegistration, validateLogin } from "../middleware/validation.js";

router.route("/register").post(validateRegistration, register);
router.route("/login").post(validateLogin, login);
router.route("/me").get(protect, me);

export default router;