import { IUser } from "../user/commonInterface.js";

export interface IAuthService {
  login(email: string, password: string): Promise<IUser | null>;
  // logout(): Promise<void>;
}
