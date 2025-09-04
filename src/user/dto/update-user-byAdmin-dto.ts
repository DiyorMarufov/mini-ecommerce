import { Role } from "src/common/enum";
import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserByAdminDto {
  @ApiProperty({ enum: Role, type: "string" })
  @IsEnum(Role)
  role?: Role;
}
