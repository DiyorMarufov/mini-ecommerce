import {
  Controller,
  Get,
  Body,
  UseGuards,
  Req,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Request } from "express";
import { AuthGuard } from "src/common/guard/authGuard";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from "@nestjs/swagger";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateUserByAdminDto } from "./dto/update-user-byAdmin-dto";
import { checkRoles } from "src/common/decorator/rolesDecorator";
import { Role } from "src/common/enum";
import { AdminGuard } from "src/common/guard/adminGuard";
import { UserGuard } from "src/common/guard/userGuard";
import { OwnerGuard } from "../common/guard/ownerGuard";
import { RolesGuard } from "../common/guard/rolesGuard";

@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  findOne(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    return this.userService.findOne(id, req);
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

  @UseGuards(AuthGuard, UserGuard, RolesGuard)
  @checkRoles(Role.OWNER)
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
