import { Request, Response, NextFunction } from "express";
import { ProcessTriageInput } from "@/contracts/workflow.contracts";
import { runTriageInspect, runTriageProcess } from "@/server/services/triage.service";

export async function triageProcess(
  req: Request<unknown, unknown, ProcessTriageInput>,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.body?.selector?.state) {
      res.status(400).json({
        error: "Missing selector.state",
      });
      return;
    }

    const result = await runTriageProcess(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function triageInspect(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await runTriageInspect();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
