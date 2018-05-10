import { Service } from 'typedi';

export enum Environment {
  development = 'development',
  production = 'production',
}

@Service()
export class EnvService {

  private readonly _env = process.env.NODE_ENV || Environment.development;
  private readonly _port = process.env.APP_PORT || 8080;

  private readonly _dbHost = process.env.DB_HOST || '192.168.99.100';
  private readonly _dbPort = process.env.DB_PORT || '3306';
  private readonly _dbName = process.env.DB_NAME || 'collabio';
  private readonly _dbUsername = process.env.DB_USERNAME || 'user';
  private readonly _dbPassword = process.env.DB_PASSWORD || 'password';

  private readonly _jwtSecret: string = process.env.JWT_SECRET || 'StandardDevelopmentSecret';

  public readonly _defaultUserName: string = process.env.DEF_USER_NAME || 'defaultRootUser';
  public readonly _defaultUserPassword: string = process.env.DEF_USER_PASSWORD || 'defaultRootUserPassword';

  get Env(): string {
    return this._env;
  }

  get Port(): number {
    return Number(this._port);
  }

  get DbHost(): string {
    return this._dbHost;
  }

  get DbPort(): string {
    return this._dbPort;
  }

  get DbName(): string {
    return this._dbName;
  }

  get DbUsername(): string {
    return this._dbUsername;
  }

  get DbPassword(): string {
    return this._dbPassword;
  }

  get JwtSecret(): string {
    return this._jwtSecret;
  }

  get DefaultUserName(): string {
    return this._defaultUserName;
  }

  get DefaultUserPassword(): string {
    return this._defaultUserPassword;
  }
}
