import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  UseInterceptors,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { ConfirmOtpUserDto } from "./dto/confirm-otp-dto";
import { SignInUserDto } from "./dto/signin-dto";
import { Request, Response } from "express";
import { AuthGuard } from "src/common/guard/authGuard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from "@nestjs/swagger";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateUserByAdminDto } from "./dto/update-user-byAdmin-dto";
import { checkRoles } from "src/common/decorator/rolesDecorator";
import { Role } from "src/common/enum";
import { AdminGuard } from "src/common/guard/adminGuard";
import { UserGuard } from "src/common/guard/userGuard";
import { NewOtpDto } from "./dto/new-otp.dto";
import { OwnerGuard } from "../common/guard/ownerGuard";

@ApiTags("User")
@UseInterceptors(CacheInterceptor)
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("signin-admin")
  @ApiOperation({ summary: "Sign in as admin with email and password" })
  @ApiBody({ type: SignInUserDto })
  @ApiResponse({ status: 200, description: "Admin signed in successfully" })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - invalid credentials",
  })
  async signInAdmin(
    @Body() signInAdmin: SignInUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.userService.signinAdmin(signInAdmin, res);
  }

  @Post("signup")
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: "User successfully registered" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.signUp(createUserDto);
  }

  @Post("confirm-otp")
  @ApiOperation({ summary: "Confirm OTP sent to email or phone" })
  @ApiBody({ type: ConfirmOtpUserDto })
  @ApiResponse({ status: 200, description: "OTP confirmed successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired OTP" })
  async confirmOtp(@Body() confirmOtpDto: ConfirmOtpUserDto) {
    return this.userService.confirmOtp(confirmOtpDto);
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
    return this.userService.signIn(userSignInDto, res);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @checkRoles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "List of users" })
  @Get()
  findAll(@Req() req: Request) {
    return this.userService.findAll(req);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @checkRoles(Role.OWNER, Role.ADMIN)
  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({ status: 200, description: "User found" })
  @ApiResponse({ status: 404, description: "User not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Get("me")
  @ApiOperation({ summary: "Get authenticated user profile" })
  @ApiBearerAuth("JWT-auth")
  @ApiResponse({ status: 200, description: "Authenticated user profile" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getProfile(@Req() req: Request) {
    return this.userService.authUserProfile(req);
  }

  @ApiOperation({ summary: "Generate a new OTP" })
  @ApiResponse({
    status: 201,
    description: "Otp sent to the email",
  })
  @Post("new-opt")
  newOtp(@Body() newOtpDto: NewOtpDto) {
    return this.userService.newOtp(newOtpDto);
  }

  @UseGuards(AuthGuard, UserGuard)
  @checkRoles(Role.OWNER, Role.ADMIN, Role.USER)
  @Patch("/:id")
  @ApiOperation({ summary: "Update user information (self or by admin)" })
  @ApiBearerAuth("JWT-auth")
  @ApiParam({
    name: "id",
    type: Number,
    description: "ID of the user to update",
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async updateUser(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.updateUser(id, updateUserDto);
  }

  @UseGuards(AuthGuard, OwnerGuard)
  @checkRoles(Role.OWNER)
  @Patch("role/:id")
  @ApiOperation({ summary: "Update user role (admin only)" })
  @ApiBearerAuth("JWT-auth")
  @ApiParam({ name: "id", type: Number, description: "User ID to update role" })
  @ApiBody({ type: UpdateUserByAdminDto })
  @ApiResponse({ status: 200, description: "User role updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid input or role" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async updateUserByAdmin(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserByAdmin: UpdateUserByAdminDto
  ) {
    return this.userService.updateUserRole(id, updateUserByAdmin);
  }

  @UseGuards(AuthGuard, UserGuard)
  @checkRoles(Role.OWNER, Role.ADMIN, Role.USER)
  @Delete("/:id")
  @ApiOperation({ summary: "Delete user by ID" })
  @ApiBearerAuth("JWT-auth")
  @ApiParam({
    name: "id",
    type: Number,
    description: "ID of the user to delete",
  })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async deleteUser(@Param("id", ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
