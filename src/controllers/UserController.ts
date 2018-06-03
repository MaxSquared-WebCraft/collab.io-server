import { Authorized, Body, BodyParam, Delete, Get, JsonController, Param, Patch, Post } from 'routing-controllers';
import { Logger } from '../decorators/Logger';
import { ILogger } from '../interfaces/ILogger';
import { Inject } from 'typedi';
import { UserServiceImpl } from '../services/controllers/UserServiceImpl';
import { IUserService } from '../interfaces/IUserService';
import { LoginUser } from '../models/LoginUser';
import { User } from '../models/entities/User';
import { RegisterUser } from '../models/RegisterUser';

@JsonController('/user')
export class UserController {

  constructor(
    @Logger() private readonly logger: ILogger,
    @Inject(UserServiceImpl) private readonly userService: IUserService,
  ) {
    this.logger.verbose('Initializing User controller');
  }

  @Post('/login')
  public login(@Body() loginUser: LoginUser) {
    return this.userService.login(loginUser);
  }

  @Authorized()
  @Get()
  public getUsers(): Promise<User[]> {
    return this.userService.listUsers();
  }

  @Authorized()
  @Post()
  public addUser(@Body() registerUser: RegisterUser): Promise<User> {
    return this.userService.addUser(registerUser);
  }

  @Authorized()
  @Delete('/:userId')
  public deleteUser(@Param('userId') userId: number): Promise<void> {
    return this.userService.removeUser(userId);
  }

  @Authorized()
  @Patch('/:userId')
  public updateUserPassword(@Param('userId') userId: number, @BodyParam('password') password: string) {
    return this.userService.updateUserPassword(userId, password);
  }
}
