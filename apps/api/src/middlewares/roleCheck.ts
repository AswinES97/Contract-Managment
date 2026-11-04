import { NextFunction, Request, Response } from "express";
import UserRoles from "../constants/users.js";
import StatusCode from "../constants/statusCodes.js";
import { logErr } from "../config/logger.js";

type AllowedRole = UserRoles.ADMIN | UserRoles.END_USER | UserRoles.VIEWER;

export const checkRole = (...allowedRoles: [AllowedRole, ...AllowedRole[]]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const role = req.authData?.role;

      if (!role) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      if (!allowedRoles.some((allowedRole) => allowedRole === role)) {
        res.status(StatusCode.FORBIDDEN).json({ message: "Role mismatch" });
        return;
      }

      next();
    } catch (error) {
      logErr("Error in ROLE CHECK: ", error);
      res
        .status(StatusCode.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  };
};
