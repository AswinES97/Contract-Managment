import { NextFunction, Request, Response } from "express";
import { IAuthService } from "../interfaces/auth/serviceInterface.js";
import StatusCode from "../constants/statusCodes.js";
import IJwtTokenService from "../interfaces/tokens/jwtTokenInterface.js";

class AuthController {
  private authService: IAuthService;
  private jwtService: IJwtTokenService;

  constructor(authService: IAuthService, jwtService: IJwtTokenService) {
    this.authService = authService;
    this.jwtService = jwtService;
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res
          .status(StatusCode.BAD_REQUEST)
          .json({ message: "Email and password are required" });
        return;
      }

      const userData = await this.authService.login(email, password);
      //todo: token generation and response

      res.status(StatusCode.OK).json({ message: "Login successful", userData });
      return;
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
