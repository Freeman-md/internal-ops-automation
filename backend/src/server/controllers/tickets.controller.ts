import { Request, Response, NextFunction } from "express";
import { ProcessTicketsInput } from "@/contracts/workflow.contracts";
import { sendWorkflowError } from "@/server/http/responders";
import {
  runTicketsAll,
  runTicketsInspect,
  runTicketsResolve,
  runTicketsStart,
} from "@/server/services/tickets.service";

export async function ticketsStart(
  req: Request<unknown, unknown, ProcessTicketsInput>,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.body?.selector?.state) {
      sendWorkflowError(res, "Missing selector.state", 400);
      return;
    }
    if (!req.body?.expectedState) {
      sendWorkflowError(res, "Missing expectedState", 400);
      return;
    }

    const result = await runTicketsStart(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function ticketsResolve(
  req: Request<unknown, unknown, ProcessTicketsInput>,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.body?.selector?.state) {
      sendWorkflowError(res, "Missing selector.state", 400);
      return;
    }
    if (!req.body?.expectedState) {
      sendWorkflowError(res, "Missing expectedState", 400);
      return;
    }

    const result = await runTicketsResolve(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function ticketsInspect(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await runTicketsInspect();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function ticketsAll(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await runTicketsAll();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
