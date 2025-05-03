import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
import aclMiddleware from "../middlewares/acl.middleware";
import mediaMiddleware from "../middlewares/media.middleware";
import { ROLES } from "../utils/constant";
import mediaController from "../controllers/media.controller";
import categoryController from "../controllers/category.controller";
import brandController from "../controllers/brand.controller";

const router = express.Router();


router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", authMiddleware, authController.me);
router.post("/auth/verify-otp", authController.verifyOtp);
router.post("/auth/login-google", authController.loginGoogle);

router.post("/media/upload-single", [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]), mediaMiddleware.single("file")], mediaController.single);
router.post("/media/upload-multiple", [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MEMBER]), mediaMiddleware.multiple("files")], mediaController.multiple);
router.delete("/media/remove", [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MEMBER])], mediaController.remove);

router.post("/category", [authMiddleware, aclMiddleware([ROLES.ADMIN])], categoryController.create)
router.get("/category", categoryController.findAll)
router.get("/category/:id", categoryController.findOne)
router.put("/category/:id", [authMiddleware, aclMiddleware([ROLES.ADMIN])], categoryController.update)
router.delete("/category/:id", [authMiddleware, aclMiddleware([ROLES.ADMIN])], categoryController.remove)

router.post("/brand", [authMiddleware, aclMiddleware([ROLES.ADMIN])], brandController.create);
router.get("/brand", brandController.findAll);
router.get("/brand/:id", brandController.findOne);
router.put("/brand/:id", [authMiddleware, aclMiddleware([ROLES.ADMIN])], brandController.update);
router.delete("/brand/:id", [authMiddleware, aclMiddleware([ROLES.ADMIN])], brandController.remove);

export default router;