import express from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
import aclMiddleware from "../middlewares/acl.middleware";
import mediaMiddleware from "../middlewares/media.middleware";
import { ROLES } from "../utils/constant";
import mediaController from "../controllers/media.controller";
import categoryController from "../controllers/category.controller";
import brandController from "../controllers/brand.controller";
import sneakerController from "../controllers/sneaker.controller";

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

router.post("/brands", [authMiddleware, aclMiddleware([ROLES.ADMIN])], brandController.create);
router.get("/brands", brandController.findAll);
router.get("/brands/:id", brandController.findOne);
router.put("/brands/:id", [authMiddleware, aclMiddleware([ROLES.ADMIN])], brandController.update);
router.delete("/brands/:id", [authMiddleware, aclMiddleware([ROLES.ADMIN])], brandController.remove);

router.post("/sneakers", [authMiddleware, aclMiddleware([ROLES.ADMIN])], sneakerController.create);
router.get("/sneakers", sneakerController.findAll);
router.get("/sneakers/:id", sneakerController.findOne);
router.put("/sneakers/:id", [authMiddleware, aclMiddleware([ROLES.ADMIN])], sneakerController.update);
router.delete("/sneakers/:id", [authMiddleware, aclMiddleware([ROLES.ADMIN])], sneakerController.remove);
router.get("/sneakers/:slug/slug", sneakerController.findOneBySlug);

export default router;