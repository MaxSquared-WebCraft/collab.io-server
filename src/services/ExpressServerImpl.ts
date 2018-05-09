import { Service, Token } from 'typedi';
import { useExpressServer } from 'routing-controllers';
import { IServer } from '../interfaces/IServer';
import { Environment, EnvService } from './EnvService';
import { Logger } from '../decorators/Logger';
import { ILogger } from '../interfaces/ILogger';
import { AuthService } from './AuthService';
import { UserController } from '../controllers/UserController';

import * as express from 'express';
import * as expressWinston from 'express-winston';
import * as winston from 'winston';
import * as http from 'http';

import Express = express.Express;
import Server = http.Server;

export const ExpressServerImpl = new Token<IServer>();

@Service(ExpressServerImpl)
export class ExpressImpl implements IServer {

  private readonly server: http.Server;
  private readonly app: express.Express;

  constructor(
    @Logger() private readonly logger: ILogger,
    private readonly envService: EnvService,
    private readonly authService: AuthService,
  ) {

    this.app = express();

    this.addExpressLoggerMiddleware();

    useExpressServer(this.App, {
      cors: true,
      authorizationChecker: this.authService.authorizationChecker,
      defaults: {
        nullResultCode: 404,
        undefinedResultCode: 204,
      },
      controllers: [
        UserController
      ]
    });

    this.server = new http.Server(this.App);
  }

  private readonly addExpressLoggerMiddleware = (): void => {

    this.logger.verbose('Initializing winston logging middleware...');

    if (this.envService.Env === Environment.production) {
      this.App.use(expressWinston.errorLogger({
        transports: [
          new winston.transports.Console({
            json: true,
            colorize: true
          })
        ],
        winstonInstance: this.logger.Instance,
      }));
    } else {
      this.App.use(expressWinston.logger({
        transports: [
          new winston.transports.Console({
            json: true,
            colorize: true
          })
        ],
        winstonInstance: this.logger.Instance,
      }));
    }
  };

  // noinspection JSUnusedGlobalSymbols
  public readonly start = (port: number): void => {
    this.App.listen(port);
  };

  get App(): Express {
    return this.app;
  }

  get Server(): Server {
    return this.server;
  }
}
