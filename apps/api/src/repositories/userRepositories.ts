import { PrismaClient } from "@prisma/client/extension";
import { IUserRepository } from "../interfaces/user/repositoryInterface.js";
import { IUser } from "../interfaces/user/commonInterface.js";

// todo: check returns and interface

class UserRepositories implements IUserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    const user: IUser | null = await this.prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  async createUser(user: {
    email: string;
    password: string;
    role: "END_USER" | "END_USER";
  }): Promise<void> {}
}


export default UserRepositories;
