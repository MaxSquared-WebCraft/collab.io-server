import { Service } from 'typedi';
import * as path from 'path';

export enum Environment {
  development = 'development',
  production = 'production',
}

@Service()
export class EnvService {

  private readonly env = process.env.NODE_ENV || Environment.development;
  private readonly port = process.env.APP_PORT || 8080;
  private readonly dbConfigPath = process.env.DB_CONFIG_PATH || '/dbConfig.json';

  private readonly jwtSecret: string = process.env.JWT_SECRET || 'StandardDevelopmentSecret';

  public readonly defaultUserName: string = process.env.DEF_USER_NAME || 'defaultRootUser';
  public readonly defaultUserPassword: string = process.env.DEF_USER_PASSWORD || 'defaultRootUserPassword';

  get Env(): string {
    return this.env;
  }

  get Port(): number {
    return Number(this.port);
  }

  get DbConfigPath(): string {
    return path.resolve(process.cwd() + this.dbConfigPath);
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
