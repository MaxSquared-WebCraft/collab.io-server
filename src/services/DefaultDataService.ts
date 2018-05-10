import * as bcrypt from 'bcryptjs';

import { Service } from 'typedi';
import { ILogger } from '../interfaces/ILogger';
import { Logger } from '../decorators/Logger';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';
import { User } from '../models/entities/User';
import { EnvService } from './EnvService';
import { AuthService } from './AuthService';

@Service()
export class DefaultDataService {

  constructor(
    @Logger() private readonly logger: ILogger,
    @OrmRepository(User) private readonly userRepository: Repository<User>,
    private readonly envService: EnvService,
    private readonly authService: AuthService,
  ) { }

  private checkIfStillDefaultPassword(user: User) {
    if (bcrypt.compareSync(this.envService.DefaultUserPassword, user.pwHash))
      this.logger.warn('You haven\'t changed the default password yet! DO IT NAU!');
  }

  private async addDefaultUser(): Promise<any> {

    const user: User = await this.userRepository.findOne({ name: this.envService.DefaultUserName });

    if (user) {
      this.checkIfStillDefaultPassword(user);
      return user;
    }

    this.logger.warn('[DB_INIT]: Creating default user, please change its password IMMEDIATELY');

    const hash = await this.authService.createPwHash(this.envService.DefaultUserPassword);

    const defaultUser = new User();
    defaultUser.name = this.envService.DefaultUserName;
    defaultUser.pwHash = hash;

    return this.userRepository.save(defaultUser);
  }

  public async setupDatabase(): Promise<any> {
    return this.addDefaultUser();
  }
}
