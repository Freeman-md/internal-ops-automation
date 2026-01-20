import { Router } from "express";
import { authenticateSession } from "@/server/controllers/auth.controller";

const router = Router();

router.post("/auth/authenticate", authenticateSession);

export default router;
