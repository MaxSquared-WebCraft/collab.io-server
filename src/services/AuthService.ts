import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

import { Action, UnauthorizedError } from 'routing-controllers';
import { User } from '../models/entities/User';
import { Token } from '../models/Token';
import { Service } from 'typedi';
import { ILogger } from '../interfaces/ILogger';
import { Logger } from '../decorators/Logger';
import { EnvService } from './EnvService';

@Service()
export class AuthService {

  constructor(
    @Logger() private readonly logger: ILogger,
    private readonly envService: EnvService,
  ) { }

  public createToken(user: User): Promise<string> {
    return new Promise((resolve) => {
      const payload: Token = {
        name: user.name,
      };
      jwt.sign(payload, this.envService.JwtSecret, { expiresIn: '1d' }, (token) => {
        resolve(token)
      });
    })
  }

  public verifyToken(token: string): Promise<Token> {
    return new Promise((resolve) => {
      jwt.verify(token, this.envService.JwtSecret, (err, decoded) => {
        if (err) resolve(null);
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

}
