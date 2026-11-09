import { IUser } from "./commonInterface.js";

export interface IUserRepository {
  getUserByEmail(email: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[] | undefined>;
  createUser(
    email: string,
    password: string,
    role: string,
    isActive: boolean,
    name?: string,
  ): Promise<IUser>;
  changeStatus(id: string, isActive: boolean): Promise<boolean | undefined>;
  changeRole(id: string, role: string): Promise<boolean | undefined>;
}
