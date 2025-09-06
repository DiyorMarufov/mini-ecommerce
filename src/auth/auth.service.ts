import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { decrypt, encrypt } from "../common/bcrypt";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { errorCatch } from "../common/helpers/error-catch";
import { goodResponse } from "../common/helpers/good-response";
import { writeToCookie } from "../common/cookie/cookie";
import { SignInUserDto } from "../user/dto/signin-dto";
import { decode, encode } from "../common/helpers/crypto";
import { addMinutesToDate } from "../common/helpers/addMinutes";
import { VerifyOtpDto } from "../user/dto/verify-otp.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MailService } from "../common/mail/mail.service";
import { TokenService } from "../common/token/token";
import { Otp } from "../user/entities/otp.entity";
import { User } from "../user/entities/user.entity";
import { NewOtpDto } from "../user/dto/new-otp.dto";
import * as otpGenerator from "otp-generator";
import { Role } from "../common/enum";
import { UserService } from "../user/user.service";
import { Request, Response } from "express";
import { Payload } from "../common/types/payload.type";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Otp) private otpRepo: Repository<Otp>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<object | undefined> {
    const existingEmail = await this.userRepo.findOne({
      where: { email: createUserDto.email },
    });
    if (existingEmail)
      throw new BadRequestException(
        `Email ${createUserDto.email} already exists`
      );

    const { password, email } = createUserDto;
    const hashedPassword = await encrypt(password);
    await this.userRepo.save({
      ...createUserDto,
      password: hashedPassword,
      role: Role.USER,
    });

    return this.newOtp({ email });
  }

  async signIn(userSignInDto: SignInUserDto, res: Response): Promise<object> {
    try {
      const { email, password } = userSignInDto;

      const user = await this.userRepo.findOne({ where: { email } });

      if (!user) {
        throw new BadRequestException("Email or password incorrect");
      }

      const isPasswordMatch = await decrypt(password, user.password);

      console.log(isPasswordMatch, "isPasswordMatch");
      console.log(password, "password");
      if (!isPasswordMatch) {
        throw new BadRequestException("Email or password incorrect");
      }

      const { id, role } = user;
      const payload: Payload = { id, role };

      const accessToken = await this.tokenService.generateAccessToken(payload);
      const refreshToken =
        await this.tokenService.generateRefreshToken(payload);

      writeToCookie(res, "refreshTokenUser", refreshToken);

      return goodResponse(200, "success", accessToken);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async authUserProfile(req: Request): Promise<any> {
    try {
      const user = (req as any).user;
      if (user && "id" in user) {
        const id = user.id;
        const userData = await this.userRepo.findOne({ where: { id } });

        if (!userData) {
          throw new NotFoundException(`User not found`);
        }

        const authUser = {
          id: userData.id,
          fname: userData.fname,
          lname: userData.lname,
          address: userData.address,
          email: userData.email,
        };

        return goodResponse(200, "success", authUser);
      } else {
        throw new UnauthorizedException("User not authenticated");
      }
    } catch (error) {
      return errorCatch(error);
    }
  }

  async newOtp(userEmailDto: NewOtpDto) {
    const { email } = userEmailDto;

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const now = new Date();
    const expiration_time = addMinutesToDate(now, 5);
    await this.otpRepo.delete({ email });

    const newOtpData = await this.otpRepo.save({
      otp,
      email,
      expiration_time,
    });

    const details = {
      timestamp: now,
      email,
      otp_id: newOtpData.id,
    };

    const encodedData = await encode(JSON.stringify(details));
    try {
      await this.mailService.sendOtp(email, `Otp verification`, otp);
    } catch (error) {
      throw new ServiceUnavailableException(
        "Emailga xat yuborishda xatolik",
        error.message
      );
    }

    return {
      message: "OTP emailga yuborildi",
      verificationKey: encodedData,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { verificationKey, email, otp } = verifyOtpDto;

    const currentDate = new Date();
    const decodedDate = await decode(verificationKey);
    const details = JSON.parse(decodedDate);
    if (details.email != email)
      throw new BadRequestException("OTP bu eamilga yuborilmagan");

    const resultOtp = await this.otpRepo.findOneBy({ id: details.otp_id });

    if (resultOtp == null) throw new BadRequestException("Bunday OTP yo'q");
    if (resultOtp.verified)
      throw new BadRequestException("OTP avval tekshirilgan");
    if (resultOtp.expiration_time < currentDate)
      throw new BadRequestException("Bu OTP'ning vaqti tugagan");
    if (resultOtp.otp != otp) throw new BadRequestException("OTP mos emas");

    const user = await this.userRepo.findOneBy({ email });

    if (!user) {
      throw new NotFoundException(`User not found with email ${email}`);
    }
    await this.userRepo.save({ ...user, is_active: true });

    if (!user)
      throw new BadRequestException("Bunday emaillik foydalanuvchi yo'q");

    await this.otpRepo.update({ id: details.otp_id }, { verified: true });

    return { message: "🎉 Tabriklayman, siz active bo'ldingiz" };
  }

  async activeUser(id: number, req: Request) {
    const { data: user } = await this.userService.findOne(id, req);

    if (user.isActive)
      return goodResponse(
        200,
        `${id} id'lik user muvaffaqiyatli active'lashtirildi`,
        user
      );
    await this.userRepo.save({ ...user, isActive: true });

    return goodResponse(
      200,
      `${id} id'lik user muvaffaqiyatli active'lashtirildi`,
      user
    );
  }
}
