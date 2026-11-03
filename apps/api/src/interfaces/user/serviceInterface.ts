import { IUser } from "./commonInterface.js";

export interface IUserService {
  getUserByEmail(email: string): Promise<IUser | null>;
  // createUser(user: IUser): Promise<void>;
}
