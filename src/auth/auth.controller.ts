import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { ConfirmOtpUserDto } from "../user/dto/confirm-otp-dto";
import { VerifyOtpDto } from "../user/dto/verify-otp.dto";
import { SignInUserDto } from "../user/dto/signin-dto";
import { AuthGuard } from "../common/guard/authGuard";
import { Response } from "express";
import { NewOtpDto } from "../user/dto/new-otp.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post("confirm-otp")
  @ApiOperation({ summary: "Confirm OTP sent to email or phone" })
  @ApiBody({ type: ConfirmOtpUserDto })
  @ApiResponse({ status: 200, description: "OTP confirmed successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired OTP" })
  async confirmOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post("signin")
  @ApiOperation({ summary: "Sign in with email and password" })
  @ApiBody({ type: SignInUserDto })
  @ApiResponse({ status: 200, description: "User signed in successfully" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - invalid credentials",
  })
  async signIn(
    @Body() userSignInDto: SignInUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signIn(userSignInDto, res);
  }

  @UseGuards(AuthGuard)
  @Get("me")
  @ApiOperation({ summary: "Get authenticated user profile" })
  @ApiBearerAuth("JWT-auth")
  @ApiResponse({ status: 200, description: "Authenticated user profile" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfile(@Req() req: Request) {
    return this.authService.authUserProfile(req);
  }

  @ApiOperation({ summary: "Generate a new OTP" })
  @ApiResponse({
    status: 201,
    description: "Otp sent to the email",
  })
  @Post("new-opt")
  newOtp(@Body() newOtpDto: NewOtpDto) {
    return this.authService.newOtp(newOtpDto);
  }

  @Patch("active/:id")
  active(@Param("id", ParseIntPipe) id: number) {
    return this.authService.activeUser(id);
  }
}
