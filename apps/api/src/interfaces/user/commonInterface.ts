import UserRoles from "../../constants/users.js";

export interface IUser {
  email: string;
  password: string;
  role: UserRoles.END_USER | UserRoles.END_USER;
}
