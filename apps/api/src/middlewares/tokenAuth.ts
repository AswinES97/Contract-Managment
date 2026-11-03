import jwt from "jsonwebtoken";
import { env } from "../config/envConfig.js";
import { Request, Response, NextFunction } from "express";
import StatusCode from "../constants/statusCodes.js";
import { log, logErr } from "../config/logger.js";
import JwtTokenService from "../services/tokens/jwtTokenService.js";

const jwtTokenService = new JwtTokenService();

export const generateToken = async (payload: any): Promise<string> => {
  const { _id, role } = payload;
  return await jwtTokenService.createToken(_id, role);
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers["authorization"] as string;

  if (!authHeader) {
    console.error("AUTH HEADER TOKEN MISSING");
    log("AUTH HEADER TOKEN MISSING");
    res.status(StatusCode.UNAUTHORIZED).json({
      message: "Your are Unauthorized",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    log("ACCESS TOKEN MISSING");
    res.status(StatusCode.UNAUTHORIZED).json({
      message: "Access token missing",
    });
    return;
  }

  jwt.verify(token, env.JWT_TOKEN_SECRET, async (err, payload) => {
    if (err) {
      res.status(StatusCode.UNAUTHORIZED).json({
        message: "Unauthorized!",
      });
      return;
    } else {
      const payloadTyped = payload as { id: string; role: string };
      // Todo: get user from db and check if user exists and is active
      // Todo: save in redis if needed
      // req.authData = payload;
      next();
    }
  });
};
