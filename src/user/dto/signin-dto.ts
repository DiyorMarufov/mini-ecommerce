import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignInUserDto {
  @ApiProperty({ example: 'ahmad@gmail.com' })
  @IsEmail()
  email: string;
  @ApiProperty({ example: 'Ahmad123!' })
  @IsString()
  password: string;
}