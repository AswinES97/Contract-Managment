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

  changeStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isActive } = req.body;
      const id = req.params.id as string;

      const updatedUserData = await this.userService.changeStatus(id, isActive);
      if (updatedUserData) {
        res.status(StatusCode.OK).json({ message: "Updated Successfully" });
        return;
      }
    } catch (err) {
      next(err);
    }
  };

  changeRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = req.body;
      const id = req.params.id as string;

      const updatedUserData = await this.userService.changeRole(id, role);
      if (updatedUserData) {
        res.status(StatusCode.OK).json({ message: "Updated Successfully" });
        return;
      }
    } catch (err) {
      next(err);
    }
  };
}
