import { NextFunction, Request, Response } from "express";
import { IUserService } from "../interfaces/user/serviceInterface.js";
import StatusCode from "../constants/statusCodes.js";

export class UserController {
  private userService: IUserService;
  constructor(userService: IUserService) {
    this.userService = userService;
  }

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, role, isActive, name } = req.body;
      const userData = await this.userService.createUser(
        email,
        password,
        role,
        isActive,
        name,
      );
      return res
        .status(StatusCode.CREATED)
        .json({ message: "Created Successfully", data: userData });
    } catch (err) {
      next(err);
    }
  };

  getAllUsers = async (
    req: Request,
    res: Response,
    nextFunction: NextFunction,
  ) => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(StatusCode.OK).json({ message: "Success", data: users });
    } catch (error) {
      nextFunction(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, role, isActive, name } = req.body;
      const { id } = req.authData as { id: string };

      const updatedUserData = await this.userService.updateUser(
        id,
        email,
        role,
        isActive,
        name,
      );
      if (updatedUserData) {
        res.status(StatusCode.OK).json({ message: "Updated Successfully" });
      }
    } catch (err) {
      next(err);
    }
  };
}
