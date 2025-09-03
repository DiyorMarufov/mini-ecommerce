import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { Role } from "../common/enum";
import config from "src/config";
import { errorCatch } from "src/common/helpers/error-catch";
import { decrypt, encrypt } from "src/common/bcrypt";
import { CreateUserDto } from "./dto/create-user.dto";
import { generateOTP } from "src/common/otp";
import { MailService } from "src/common/mail/mail.service";
import { goodResponse } from "src/common/helpers/good-response";
import { ConfirmOtpUserDto } from "./dto/confirm-otp-dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { writeToCookie } from "src/common/cookie/cookie";
import { Request, Response } from "express";
import { TokenService } from "src/common/token/token";
import { SignInUserDto } from "./dto/signin-dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateUserByAdminDto } from "./dto/update-user-byAdmin-dto";

export interface Payload {
  id: number;
  role: Role;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly tokenService: TokenService
  ) {}
  async onModuleInit(): Promise<void> {
    try {
      const isSuperAdmin = await this.userRepo.findOne({
        where: { role: Role.OWNER as unknown as Role.ADMIN },
      });
      if (!isSuperAdmin) {
        const hashedPassword = await encrypt(config.ADMIN_PASSWORD);
        const SUPER_ADMIN = this.userRepo.create({
          fname: config.ADMIN_FULL_NAME,
          email: config.ADMIN_EMAIL,
          password: hashedPassword,
          role: Role.OWNER,
        });
        await this.userRepo.save(SUPER_ADMIN);
      }
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    const allUsers = await this.userRepo.find({
      select: {
        address: true,
        email: true,
        fname: true,
        lname: true,
        id: true,
        role: true,
      },
    });

    return goodResponse(200, "Barcha users muvaffaqiyatli olindi", allUsers);
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      select: {
        address: true,
        email: true,
        fname: true,
        lname: true,
        id: true,
        role: true,
      },
    });
    if (user) throw new NotFoundException(`${id} id'lik user topilmadi`);

    return goodResponse(200, `${id} id'lik user muvaffaqiyatli olindi`, user);
  }

  async signinAdmin(signInAdminDto: SignInUserDto, res: Response) {
    try {
      const { email, password } = signInAdminDto;
      const admin = await this.userRepo.findOne({ where: { email } });
      if (!admin) {
        throw new BadRequestException("Email is incorrect");
      }

      const { password: hashed_password } = admin;
      const isMatchPassword = await decrypt(password, hashed_password);
      if (!isMatchPassword) {
        throw new BadRequestException("Password is incorrect");
      }

      const { id, role } = admin;
      const payload = { id, role, email };
      const accessToken = await this.tokenService.generateAccessToken(payload);
      const refreshToken =
        await this.tokenService.generateRefreshToken(payload);

      writeToCookie(res, "refreshTokenSuperAdmin", refreshToken);
      return goodResponse(200, "success", accessToken);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async signUp(createUserDto: CreateUserDto): Promise<object | undefined> {
    try {
      const existingEmail = await this.userRepo.findOne({
        where: { email: createUserDto.email },
      });

      if (existingEmail)
        throw new BadRequestException(
          `Email ${createUserDto.email} already exists`
        );

      const { password } = createUserDto;
      const hashedPassword = await encrypt(password);
      const newUser = this.userRepo.create({
        ...createUserDto,
        password: hashedPassword,
        role: Role.USER,
      });

      await this.userRepo.save(newUser);

      const otp = generateOTP();
      await this.cacheManager.set(createUserDto.email, otp);
      await this.mailService.sendOtp(
        createUserDto.email,
        `Otp verification`,
        otp
      );

      return goodResponse(201, `Otp sent to email ${createUserDto.email}`, {});
    } catch (error) {
      return errorCatch(error);
    }
  }

  async confirmOtp(confirmOtpDto: ConfirmOtpUserDto): Promise<object> {
    try {
      const { email, otp } = confirmOtpDto;
      const user = await this.userRepo.findOne({ where: { email } });
      if (!user)
        throw new BadRequestException(
          `User with email ${email} does not exist`
        );

      const hasUser = await this.cacheManager.get(email);
      if (!hasUser || hasUser !== otp)
        throw new BadRequestException(`Incorrect or expired otp`);

      return goodResponse(200, "success", `Otp confirmed successfully`);
    } catch (e) {
      return errorCatch(e);
    }
  }

  async signIn(userSignInDto: SignInUserDto, res: Response): Promise<object> {
    try {
      const { email, password } = userSignInDto;

      const user = await this.userRepo.findOne({ where: { email } });

      if (!user) {
        throw new BadRequestException("Email or password incorrect");
      }

      const isPasswordMatch = await decrypt(password, user.password);

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

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      const existsUser = await this.userRepo.findOne({ where: { id } });

      if (!existsUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (existsUser.role === Role.OWNER) {
        throw new ForbiddenException(`Can't update the owner`);
      }

      const { affected } = await this.userRepo.update(id, updateUserDto);

      if (!affected) {
        throw new BadRequestException(`User with ID ${id} not updated`);
      }

      const updatedUser = await this.userRepo.findOne({ where: { id } });

      return goodResponse(200, "success", {
        id: updatedUser?.id,
        fname: updatedUser?.fname,
        lname: updatedUser?.lname,
        address: updatedUser?.address,
        email: updatedUser?.email,
      });
    } catch (error) {
      return errorCatch(error);
    }
  }

  async updateUserRole(id: number, updateUserByAdminDto: UpdateUserByAdminDto) {
    try {
      const existsUser = await this.userRepo.findOne({ where: { id } });

      if (!existsUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const { affected } = await this.userRepo.update(id, updateUserByAdminDto);

      if (!affected) {
        throw new BadRequestException(`User with ID ${id} not updated`);
      }

      const updatedUser = await this.userRepo.findOne({ where: { id } });

      return goodResponse(200, "success", updatedUser);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async deleteUser(id: number) {
    try {
      const existsUser = await this.userRepo.findOne({ where: { id } });

      if (!existsUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      await this.userRepo.delete(id);
      return goodResponse(200, "success", {});
    } catch (error) {
      return errorCatch(error);
    }
  }
}
