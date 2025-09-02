import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Role } from 'src/common/enum';

export class CreateUserDto {
  @ApiProperty({ example: 'Ali', description: 'Foydalanuvchining ismi' })
  @IsString()
  @IsNotEmpty()
  fname: string;

  @ApiProperty({
    example: 'Valiyev',
    required: false,
    description: 'Familiyasi',
  })
  @IsString()
  lname?: string;

  @ApiProperty({
    example: 'Tashkent, Uzbekistan',
    required: false,
    description: 'Manzili',
  })
  @IsString()
  address?: string;

  @ApiProperty({ example: 'ali@gmail.com', description: 'Email manzili' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'P@ssw0rd!', description: 'Parol' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
