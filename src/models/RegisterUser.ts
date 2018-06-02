import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { LoginUser } from './LoginUser';

export class RegisterUser extends LoginUser {

  @IsInt()
  @Max(1000)
  @Min(0)
  @IsOptional()
  role: number;
}
