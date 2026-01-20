import { Router } from "express";
import {
  statusAll,
  statusAuthAction,
  statusSession,
} from "@/server/controllers/status.controller";

const router = Router();

router.post("/status/session", statusSession);
router.post("/status/auth-action", statusAuthAction);
router.post("/status/all", statusAll);

export default router;
