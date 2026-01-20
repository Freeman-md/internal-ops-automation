import { Router } from "express";
import { triageInspect, triageProcess } from "@/server/controllers/triage.controller";

const router = Router();

router.post("/triage/process", triageProcess);
router.post("/triage/inspect", triageInspect);

export default router;
