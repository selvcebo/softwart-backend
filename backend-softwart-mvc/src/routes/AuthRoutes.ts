// src/routes/AuthRoutes.ts
import { Router }          from "express";
import { login, registro } from "../controllers/AuthController";
import { authLimiter }     from "../middlewares/rateLimit.middleware";

const router = Router();

router.post("/login",    authLimiter, login);
router.post("/registro", authLimiter, registro);

export { router as authRouter };