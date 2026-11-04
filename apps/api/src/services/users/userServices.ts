import bcrypt from "bcrypt";
import { IUser } from "../../interfaces/user/commonInterface.js";
import { IUserRepository } from "../../interfaces/user/repositoryInterface.js";
import { IUserService } from "../../interfaces/user/serviceInterface.js";

class UserService implements IUserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  createUser = async (
    email: string,
    password: string,
    role: string,
    isActive: boolean,
    name?: string,
  ): Promise<IUser> => {
    const hashedPassword = await bcrypt.hash(password, 12);
    return await this.userRepository.createUser(
      email,
      hashedPassword,
      role,
      isActive,
      name,
    );
  };

  getUserByEmail = async (email: string): Promise<IUser | null> => {
    return this.userRepository.getUserByEmail(email);
  };

  getAllUsers = async (): Promise<IUser[] | undefined> => {
    return this.userRepository.getAllUsers();
  };

  updateUser(
    id: string,
    email: string,
    role: string,
    isActive: boolean,
    name?: string,
  ): Promise<boolean | undefined> {
    return this.userRepository.updateUser(id, email, role, isActive, name);
  }
}

export default UserService;
