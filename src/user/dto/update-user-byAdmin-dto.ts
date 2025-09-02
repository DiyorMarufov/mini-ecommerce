import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { Role } from 'src/common/enum';
import { IsEnum } from 'class-validator';

export class UpdateUserByAdminDto extends PartialType(CreateUserDto) {
  @IsEnum(Role)
  role?: Role;
}
