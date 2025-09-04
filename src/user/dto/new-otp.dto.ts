import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class NewOtpDto {
  @ApiProperty({
    type: "string",
    description: "Email",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
