import { IUser } from "./commonInterface.js";

export interface IUserService {
  createUser(
    email: string,
    password: string,
    role: string,
    isActive: boolean,
    name?: string,
  ): Promise<IUser>;
  getUserByEmail(email: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[] | undefined>;
  updateUser(
    id: string,
    email: string,
    role: string,
    isActive: boolean,
    name?: string,
  ): Promise<boolean | undefined>;
}
