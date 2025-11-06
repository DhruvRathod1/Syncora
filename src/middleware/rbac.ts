import { Request, Response, NextFunction } from "express";

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req.session as any)?.user;
    if (!user || user.role !== role) {
      return res.status(403).send("Forbidden");
    }
    next();
  };
}
