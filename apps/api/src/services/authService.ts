import bcrypt from "bcrypt";
import { IAuthService } from "../interfaces/auth/serviceInterface.js";
import { IUserService } from "../interfaces/user/serviceInterface.js";
import { IUser } from "../interfaces/user/commonInterface.js";

class AuthService implements IAuthService {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  async login(email: string, password: string): Promise<IUser | null> {
    const userData = await this.userService.getUserByEmail(email);
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!userData || userData.password !== hashedPassword) {
      throw new Error("Invalid email or password");
    }
    return userData || null;
  }
  async logout(): Promise<void> {}
}

export default AuthService;
