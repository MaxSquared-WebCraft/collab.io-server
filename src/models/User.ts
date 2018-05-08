import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class LoginUser {

  @IsString()
  username: string;

  @IsString()
  password: string;
}

export class RegisterUser extends LoginUser {

  @IsInt()
  @Max(1000)
  @Min(0)
  @IsOptional()
  role: number;
}
