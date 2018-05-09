import { Service, Token } from 'typedi';
import { EnvService } from './EnvService';
import { IDbConfig } from '../interfaces/IDbConfig';
import { ILogger } from '../interfaces/ILogger';
import { Logger } from '../decorators/Logger';
import { User } from '../models/entities/User';
import { Room } from '../models/entities/Room';

export const MysqlDbServiceImpl = new Token<MysqlService>();

@Service(MysqlDbServiceImpl)
export class MysqlService implements IDbConfig {

  constructor(
    @Logger() private readonly logger: ILogger,
    private readonly envService: EnvService
  ) { }

  // noinspection JSUnusedGlobalSymbols
  public readonly getDbConfig = () => {

    const config = {
      type: 'mysql',
      synchronize: true,
      logging: false,
      host: this.envService.DbHost,
      port: this.envService.DbPort,
      database: this.envService.DbName,
      username: this.envService.DbUsername,
      password: this.envService.DbPassword,
    };

    this.logger.verbose('Initializing database with', config);

    return {
      type: 'mysql',
      synchronize: true,
      logging: false,
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      password: config.password,
      entities: [User, Room]
    };
  };
}
