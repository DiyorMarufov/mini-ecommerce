import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty } from "class-validator";

export class UpdateUserStatusDto {
  @ApiProperty({
    type: "boolean",
    example: false,
    description: "User status'i",
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
