import { Request, Response } from "express";

export function getMe(req: Request, res: Response) {
  res.json((req as any).user);
}
