import { Service } from 'typedi';

export enum Environment {
  development = 'development',
  production = 'production',
}

@Service()
export class EnvService {

  private readonly jwtSecret: Buffer;

  private readonly env = process.env.NODE_ENV || Environment.development;
  private readonly port = process.env.APP_PORT || 8080;

  private readonly dbHost = process.env.DB_HOST || '192.168.99.100';
  private readonly dbPort = process.env.DB_PORT || '3306';
  private readonly dbName = process.env.DB_NAME || 'collabio';
  private readonly dbUsername = process.env.DB_USERNAME || 'user';
  private readonly dbPassword = process.env.DB_PASSWORD || 'password';

  public readonly defaultUserName: string = process.env.DEF_USER_NAME || 'defaultRootUser';
  public readonly defaultUserPassword: string = process.env.DEF_USER_PASSWORD || 'defaultRootUserPassword';

  constructor() {
    const envSecret = process.env.JWT_SECRET;
    this.jwtSecret = !!envSecret
      ? Buffer.from(envSecret)
      : Buffer.from('StandardDevelopmentSecret');
  }

  get Env(): string {
    return this.env;
  }

  get Port(): number {
    return Number(this.port);
  }

  get DbHost(): string {
    return this.dbHost;
  }

  get DbPort(): string {
    return this.dbPort;
  }

  get DbName(): string {
    return this.dbName;
  }

  get DbUsername(): string {
    return this.dbUsername;
  }

  get DbPassword(): string {
    return this.dbPassword;
  }

  get JwtSecret(): Buffer {
    return this.jwtSecret;
  }

  get DefaultUserName(): string {
    return this.defaultUserName;
  }

  get DefaultUserPassword(): string {
    return this.defaultUserPassword;
  }
}
