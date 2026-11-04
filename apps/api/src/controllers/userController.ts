import { NextFunction, Request, Response } from "express";
import { IUserService } from "../interfaces/user/serviceInterface.js";
import StatusCode from "../constants/statusCodes.js";

export class UserController {
  private userService: IUserService;
  constructor(userService: IUserService) {
    this.userService = userService;
  }

  createUser = async (
    req: Request,
    res: Response,
    nextFunction: NextFunction,
  ) => {
    const { email, password, role, isActive, name } = req.body;

    // if (!email || !password || !role) {
    //   res.status(StatusCode.BAD_REQUEST).json({
    //     message: "All fields are required",
    //   });
    // }
    const userData = await this.userService.createUser(
      email,
      password,
      role,
      isActive,
      name,
    );
    return res.status(StatusCode.CREATED).json(userData);
  };

  getAllUsers = async (
    req: Request,
    res: Response,
    nextFunction: NextFunction,
  ) => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(StatusCode.OK).json(users);
    } catch (error) {
      nextFunction(error);
    }
  };

  updateUser = async (
    req: Request,
    res: Response,
    nextFunction: NextFunction,
  ) => {
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
  };
}
