import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Otp } from "../user/entities/otp.entity";
import { User } from "../user/entities/user.entity";
import { MailModule } from "../common/mail/mail.module";
import { TokenService } from "../common/token/token";
import { UserModule } from "../user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([User, Otp]), MailModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService, TokenService],
})
export class AuthModule {}
