import { Role } from "./user.entity";

export class CreateUserDto {
  username: string;
  password: string;
  email: string;
  role?: Role;
}
