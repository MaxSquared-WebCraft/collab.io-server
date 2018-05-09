import { Service } from 'typedi';

export enum Environment {
  development = 'development',
  production = 'production',
}

@Service()
export class EnvService {

  private readonly env = process.env.NODE_ENV || Environment.development;
  private readonly port = process.env.APP_PORT || 8080;

  private readonly _dbHost = process.env.DB_HOST || '192.168.99.100';
  private readonly _dbPort = process.env.DB_PORT || '3306';
  private readonly _dbName = process.env.DB_NAME || 'collabio';
  private readonly _dbUsername = process.env.DB_USERNAME || 'user';
  private readonly _dbPassword = process.env.DB_PASSWORD || 'password';

  private readonly jwtSecret: string = process.env.JWT_SECRET || 'StandardDevelopmentSecret';

  public readonly defaultUserName: string = process.env.DEF_USER_NAME || 'defaultRootUser';
  public readonly defaultUserPassword: string = process.env.DEF_USER_PASSWORD || 'defaultRootUserPassword';

  get Env(): string {
    return this.env;
  }

  get Port(): number {
    return Number(this.port);
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
    return this.jwtSecret;
  }

  get DefaultUserName(): string {
    return this.defaultUserName;
  }

  get DefaultUserPassword(): string {
    return this.defaultUserPassword;
  }
}
