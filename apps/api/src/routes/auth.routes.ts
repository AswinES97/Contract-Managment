import { Router } from "express";
import AuthController from "../controllers/authController.js";
import AuthService from "../services/authService.js";
import prisma from "../config/prismaConfig.js";
import JwtTokenService from "../services/tokens/jwtTokenService.js";
import UserService from "../services/users/userServices.js";
import UserRepositories from "../repositories/userRepositories.js";

const jwtService = new JwtTokenService();
const userRepository = new UserRepositories(prisma);
const userService = new UserService(userRepository);
const authService = new AuthService(userService);
const authController = new AuthController(authService, jwtService);

const authRouter = Router();

authRouter.post("/login", authController.login);

export default authRouter;
