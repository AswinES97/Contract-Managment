import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../../config/envConfig.js";
import CustomError from "../../utils/customError.js";
import StatusCode from "../../constants/statusCodes.js";
import IJwtTokenService from "../../interfaces/tokens/jwtTokenInterface.js";
import { NextFunction, Request, Response } from "express";
import { logErr } from "../../config/logger.js";

class JwtTokenService implements IJwtTokenService {
  createToken = async (id: string, role: string): Promise<string> => {
    try {
      let payload = {
        id,
        role,
      };

      const token = jwt.sign(payload, env.JWT_TOKEN_SECRET, {
        expiresIn: "7d",
      });

      return token;
    } catch (error) {
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        `Error in Authentication ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        StatusCode.INTERNAL_SERVER_ERROR,
      );
    }
  };

  verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): undefined => {
    try {
      const authHeader = req.headers["authorization"] as string;
      if (!authHeader) {
        logErr("AUTH HEADER TOKEN MISSING");
        res.status(StatusCode.UNAUTHORIZED).json({
          message: "Token missing",
        });
        return;
      }

      const token = authHeader.split(" ")[1];
      const payload = jwt.verify(token, env.JWT_TOKEN_SECRET) as JwtPayload;

      const authData = {
        id: payload.id,
        role: payload.role,
      };

      req.authData = authData;

      next();
    } catch (error) {
      throw new CustomError(
        "Invalid or expired token",
        StatusCode.UNAUTHORIZED,
      );
    }
  };
}

export default JwtTokenService;
