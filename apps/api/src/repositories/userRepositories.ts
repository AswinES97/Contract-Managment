import { PrismaClient } from "@prisma/client/extension";
import { IUserRepository } from "../interfaces/user/repositoryInterface.js";
import { IUser } from "../interfaces/user/commonInterface.js";
import { handleError } from "../middlewares/errorHandler.js";
import { omit } from "zod/mini";

// todo: check returns and interface

class UserRepositories implements IUserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  createUser = async (
    email: string,
    password: string,
    role: string,
    isActive: boolean,
    name?: string,
  ): Promise<IUser> => {
    return await this.prisma.user.create({
      data: {
        email,
        password,
        role,
        isActive,
        name,
      },
      omit: {
        password: true,
      },
    });
  };

  getUserByEmail = async (email: string): Promise<IUser | null> => {
    const user: IUser | null = await this.prisma.user.findUnique({
      where: { email },
    });
    return user;
  };

  getAllUsers = async (): Promise<IUser[] | undefined> => {
    try {
      const users = await this.prisma.user.findMany({
        omit: {
          password: true,
        },
      });
      return users;
    } catch (error) {
      handleError(error);
    }
  };

  updateUser = async (
    id: string,
    email: string,
    role: string,
    isActive: boolean,
    name?: string,
  ): Promise<boolean | undefined> => {
    try {
      const updatedData = await this.prisma.user.update({
        where: {
          id: id,
        },
        data: {
          email,
          role,
          isActive,
          name,
        },
      });

      return updatedData.length > 0 ? true : false;
    } catch (error) {
      handleError(error);
    }
  };
}

export default UserRepositories;
