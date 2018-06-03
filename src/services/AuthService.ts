import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

import { Action, NotFoundError, UnauthorizedError } from 'routing-controllers';
import { User } from '../models/entities/User';
import { IToken } from '../models/Token';
import { Service } from 'typedi';
import { ILogger } from '../interfaces/ILogger';
import { Logger } from '../decorators/Logger';
import { EnvService } from './EnvService';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { UserRepository } from '../repositories/UserRepository';

@Service()
export class AuthService {

  constructor(
    @Logger() private readonly logger: ILogger,
    @InjectRepository() private readonly userRepository: UserRepository,
    private readonly envService: EnvService,
  ) { }

  public createToken(user: User): Promise<string> {
    return new Promise((resolve) => {
      const payload: IToken = {
        name: user.name,
        id: user.id,
      };
      jwt.sign(payload, this.envService.JwtSecret, { expiresIn: '1d' }, (err, token) => {
        if (err || !token) resolve(null);
        else resolve(token);
      });
    });
  }

  public verifyToken(token: string): Promise<IToken> {
    return new Promise((resolve) => {
      jwt.verify(token, this.envService.JwtSecret, (err, decoded) => {
        if (err || !decoded) resolve(null);
        resolve(decoded);
      });
    });
  }

  public async createPwHash(password: string): Promise<string> {
    this.logger.verbose('Creating password hash');
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // this needs to be class field with arrow function as the function is passed somewhere else
  public readonly authorizationChecker = async (action: Action) => {

    const token = action.request.headers.authorization;
    const payload = await this.verifyToken(token);

    if (!payload) {
      this.logger.verbose('Not authorized error');
      throw new UnauthorizedError();
    }

    this.logger.verbose(`User [${payload.name}] is authorized.`);

    return true;
  };

  public readonly currentUserChecker = async (action: Action) => {

    const token = action.request.headers.authorization;
    const payload = await this.verifyToken(token);

    this.logger.verbose('Fetching current user', payload);

    const user = payload ? await this.userRepository.findByToken(payload) : null;

    if (!user) throw new NotFoundError('User not found');

    return user;
  }

}
