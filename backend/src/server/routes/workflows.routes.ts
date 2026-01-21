import { Router } from "express";
import { runWorkflowStream } from "@/server/controllers/workflows.controller";

const router = Router();

router.post("/workflows/run", runWorkflowStream);

export default router;
