import { Request, Response, NextFunction } from "express";
import {
  runStatusAll,
  runStatusAuthAction,
  runStatusSession,
} from "@/server/services/status.service";

export async function statusSession(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await runStatusSession();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function statusAuthAction(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await runStatusAuthAction();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function statusAll(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await runStatusAll();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
