import { Request, Response, NextFunction } from "express";
import { runAuthenticate } from "@/server/services/auth.service";

export async function authenticateSession(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await runAuthenticate();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
