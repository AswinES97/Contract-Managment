import { IUser } from "../../interfaces/user/commonInterface.js";
import { IUserRepository } from "../../interfaces/user/repositoryInterface.js";
import { IUserService } from "../../interfaces/user/serviceInterface.js";

class UserService implements IUserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return this.userRepository.getUserByEmail(email);
  }

  // async createUser(user: IUser): Promise<void> {
  //   await this.userRepository.createUser(user);
  // }
}

export default UserService;
