import { Router } from "express";
import prisma from "../config/prismaConfig.js";
import UserService from "../services/users/userServices.js";
import UserRepositories from "../repositories/userRepositories.js";
import { UserController } from "../controllers/userController.js";
import { adminRoles } from "../config/rolesConfig.js";

const userRepository = new UserRepositories(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const userRouter = Router();
// todo: validate routes

userRouter.get("/", ...adminRoles, userController.getAllUsers);
userRouter.post("/", ...adminRoles, userController.createUser);
userRouter.patch("/:id/status", ...adminRoles, userController.changeStatus);
userRouter.patch("/:id/role", ...adminRoles, userController.changeRole);

export default userRouter;
