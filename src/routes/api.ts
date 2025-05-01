import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
import aclMiddleware from "../middlewares/acl.middleware";
import mediaMiddleware from "../middlewares/media.middleware";
import { ROLES } from "../utils/constant";
import mediaController from "../controllers/media.controller";

const router = express.Router();


router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", authMiddleware, authController.me);
router.post("/auth/verify-otp", authController.verifyOtp);
router.post("/auth/login-google", authController.loginGoogle);

router.post("/media/upload-single", [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]), mediaMiddleware.single("file")], mediaController.single);
router.post("/media/upload-multiple", [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]), mediaMiddleware.multiple("files")], mediaController.multiple);
router.delete("/media/remove", [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MEMBER])], mediaController.remove);

export default router;