import { IsString } from 'class-validator';

export class LoginUser {

  @IsString()
  username: string;

  @IsString()
  password: string;
}
