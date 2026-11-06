import { NextFunction, Request, Response } from "express";
import { IAuthService } from "../interfaces/auth/serviceInterface.js";
import StatusCode from "../constants/statusCodes.js";
import IJwtTokenService from "../interfaces/tokens/jwtTokenInterface.js";

class AuthController {
  private authService: IAuthService;
  private jwtService: IJwtTokenService;

  constructor(AuthService: IAuthService, jwtService: IJwtTokenService) {
    this.authService = AuthService;
    this.jwtService = jwtService;
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ message: "Email and password are required" });
        return;
      }

      const userData = await this.authService.login(email, password);
      const token = await this.jwtService.createToken(
        userData.id,
        userData.role,
      );

      const resData = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
      };

      res
        .status(StatusCode.OK)
        .json({ message: "Login successful", data: resData, token });
      return;
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
