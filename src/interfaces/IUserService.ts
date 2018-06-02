import { User } from '../models/entities/User';
import { LoginUser } from '../models/LoginUser';
import { RegisterUser } from '../models/RegisterUser';

export interface IUserService {
  login: (loginUser: LoginUser) => Promise<string>;
  listUsers: () => Promise<User[]>;
  addUser: (loginUser: RegisterUser) => Promise<User>;
  removeUser: (userId: number) => Promise<void>;
  updateUserPassword: (userId: number, password: string) => Promise<User>;
}
