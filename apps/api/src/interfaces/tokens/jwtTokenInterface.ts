import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

interface IJwtTokenService {
  createToken(id: string, role: string): Promise<string>;
  verifyToken(req: Request, res: Response, next: NextFunction): undefined;
}

export default IJwtTokenService;
