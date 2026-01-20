import { Router } from "express";
import { aiIntent } from "@/server/controllers/ai.controller";

const router = Router();

router.post("/ai/intent", aiIntent);

export default router;
