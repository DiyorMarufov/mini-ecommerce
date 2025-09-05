import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { MailModule } from "src/common/mail/mail.module";
import { TokenService } from "src/common/token/token";
import { Otp } from "./entities/otp.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Otp]), MailModule],
  controllers: [UserController],
  providers: [UserService, TokenService],
  exports: [UserService],
})
export class UserModule {}
