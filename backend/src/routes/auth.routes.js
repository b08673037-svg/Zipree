import { Router } from "express";
import { 
  register, login, me, verifyEmailOtp, resendOtp, updateProfile, adminLogin, adminRegister
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/admin-login", adminLogin);
router.post("/admin-register", adminRegister);
router.get("/me", protect, me);
router.put("/me", protect, updateProfile);

export default router;