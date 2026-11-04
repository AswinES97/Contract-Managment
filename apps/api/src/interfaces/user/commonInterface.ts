import UserRoles from "../../constants/users.js";

export interface IUser {
  id: string;
  email: string;
  password?: string;
  role: UserRoles.ADMIN | UserRoles.END_USER | UserRoles.VIEWER;
}
