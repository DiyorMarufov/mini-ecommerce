import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "Ali", description: "Foydalanuvchining ismi" })
  @IsString()
  @IsNotEmpty()
  fname: string;

  @ApiProperty({
    example: "Valiyev",
    required: false,
    description: "Familiyasi",
  })
  @IsString()
  @IsOptional()
  lname?: string;

  @ApiProperty({
    example: "Tashkent, Uzbekistan",
    required: false,
    description: "Manzili",
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: "ali@gmail.com", description: "Email manzili" })
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }: { value: string }) => value.toLowerCase())
  email: string;

  @ApiProperty({ example: "P@ssw0rd!", description: "Parol" })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
