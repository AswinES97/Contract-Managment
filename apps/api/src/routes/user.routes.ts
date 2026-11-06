import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import JwtTokenService from "../services/tokens/jwtTokenService.js";
import UserService from "../services/users/userServices.js";
import UserRepositories from "../repositories/userRepositories.js";
import { checkRole } from "../middlewares/roleCheck.js";
import UserRoles from "../constants/users.js";
import { UserController } from "../controllers/userController.js";

const jwtService = new JwtTokenService();

const userRepository = new UserRepositories(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const userRouter = Router();

//todo: add getUserbyId if required or modify get to acquint both all or single user

userRouter.get(
  "/",
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN),
  userController.getAllUsers,
);
userRouter.post(
  "/",
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN),
  userController.createUser,
);

userRouter.patch(
  "/",
  jwtService.verifyToken,
  checkRole(UserRoles.ADMIN),
  userController.updateUser,
);

export default userRouter;
