import * as bcrypt from 'bcryptjs';

import { IUserService } from '../../interfaces/IUserService';
import { Service, Token } from 'typedi';
import { Logger } from '../../decorators/Logger';
import { ILogger } from '../../interfaces/ILogger';
import { User } from '../../models/entities/User';
import { Repository } from 'typeorm';
import { LoginUser, RegisterUser } from '../../models/User';
import { NotFoundError, UnauthorizedError } from 'routing-controllers';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { AuthService } from '../AuthService';

export const UserServiceImpl = new Token<UserService>();

@Service()
export class UserService implements IUserService{

  constructor(
    @Logger() private readonly logger: ILogger,
    @OrmRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
  ) {
    this.logger.verbose('Initializing User service');
  }

  public async login(loginUser: LoginUser): Promise<string> {

    const user: User = await this.userRepository.findOne({ name: loginUser.username });
    this.logger.verbose('User from database', user);

    if (!user) {
      this.logger.verbose('No user found');
      throw new UnauthorizedError();
    }

    return bcrypt
      .compare(loginUser.password, user.pwHash)
      .then((pwDoesMatch) => {
        if (!pwDoesMatch) throw new UnauthorizedError('Passwords do not match');
        return this.authService.createToken(user);
      })
      .catch(() => {
        this.logger.verbose('Could not verify user');
        throw new UnauthorizedError();
      });
  }

  public async listUsers(): Promise<User[]> {
    this.logger.verbose('Fetching all users');
    const users = await this.userRepository.find();
    return users.map((user) => {
      delete user.pwHash;
      return user;
    });
  }

  public async addUser(registerUser: RegisterUser): Promise<User> {

    this.logger.verbose('Adding new user:', registerUser);

    const hash = await this.authService.createPwHash(registerUser.password);

    const user = new User();
    user.name = registerUser.username;
    user.pwHash = hash;

    this.logger.verbose('Saving user', user);

    const savedUser = await this.userRepository.save(user);
    delete savedUser.pwHash;
    return savedUser;
  }

  public async removeUser(userId: number): Promise<void> {
    this.logger.verbose(`Deleting user with id ${userId}`);
    const user = await this.userRepository.findOne(userId);
    if (!user) throw new NotFoundError('User not found');
    this.logger.verbose('Delete user', user);
    await this.userRepository.remove(user);
    return undefined;
  }

  public async updateUserPassword(userId: number, password: string): Promise<User> {
    this.logger.verbose(`Updating user password of user with id ${userId}`);
    const user: User = await this.userRepository.findOne(userId);
    if (!user) throw new NotFoundError('User not found.');
    user.pwHash = await this.authService.createPwHash(password);
    const savedUser = await this.userRepository.save(user);
    delete savedUser.pwHash;
    return savedUser;
  }
}