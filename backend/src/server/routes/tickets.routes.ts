import { Router } from "express";
import {
  ticketsAll,
  ticketsInspect,
  ticketsResolve,
  ticketsStart,
} from "@/server/controllers/tickets.controller";

const router = Router();

router.post("/tickets/start", ticketsStart);
router.post("/tickets/resolve", ticketsResolve);
router.post("/tickets/inspect", ticketsInspect);
router.post("/tickets/all", ticketsAll);

export default router;
