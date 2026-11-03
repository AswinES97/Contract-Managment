import { IUser } from "./commonInterface.js";

export interface IUserRepository {
  getUserByEmail(email: string): Promise<IUser | null>;
//   createUser(user: IUser): Promise<void>;
}
