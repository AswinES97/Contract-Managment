import UserRoles from "../constants/users.js";
import { checkRole } from "../middlewares/roleCheck.js";
import JwtTokenService from "../services/tokens/jwtTokenService.js";

const jwtService = new JwtTokenService();

export const readRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER, UserRoles.VIEWER),
];
export const writeRoles = [
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN, UserRoles.END_USER),
];

export const adminRoles = [jwtService.verifyToken, checkRole(UserRoles.ADMIN)];
