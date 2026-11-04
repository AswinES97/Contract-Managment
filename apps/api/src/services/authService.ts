import bcrypt from "bcrypt";
import { IAuthService } from "../interfaces/auth/serviceInterface.js";
import { IUserService } from "../interfaces/user/serviceInterface.js";
import { IUser } from "../interfaces/user/commonInterface.js";
class AuthService implements IAuthService {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  async login(email: string, password: string): Promise<IUser> {
    const userData = await this.userService.getUserByEmail(email);
    const hashedPassword = await bcrypt.compare(
      password,
      userData?.password || "",
    );
    if (!hashedPassword || !userData) {
      throw new Error("Invalid email or password");
    }
    return userData;
  }

  async logout(): Promise<void> {}
}

export default AuthService;
