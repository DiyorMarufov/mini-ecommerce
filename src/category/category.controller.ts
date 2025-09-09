import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { checkRoles } from "src/common/decorator/rolesDecorator";
import { Role } from "src/common/enum";
import { AuthGuard } from "src/common/guard/auth.guard";
import { AdminGuard } from "src/common/guard/admin.guard";
import { Request } from "express";
import { IRequest } from "../common/types";

@ApiTags("Category")
@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(AuthGuard, AdminGuard)
  @Post()
  @ApiOperation({ summary: "Create new category" })
  @ApiResponse({ status: 201, description: "Category successfully created" })
  create(@Req() req: IRequest, @Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto, req);
  }

  @Get()
  @ApiOperation({ summary: "Get all categories" })
  @ApiResponse({ status: 200, description: "List of categories" })
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get category by ID" })
  @ApiResponse({ status: 200, description: "Category found" })
  @ApiResponse({ status: 404, description: "Category not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Patch(":id")
  @ApiOperation({ summary: "Update category by ID" })
  @ApiResponse({ status: 200, description: "Category updated" })
  update(
    @Req() req: IRequest,
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.update(id, updateCategoryDto, req);
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Delete(":id")
  @ApiOperation({ summary: "Delete category by ID" })
  @ApiResponse({ status: 200, description: "Category deleted" })
  remove(@Req() req: IRequest, @Param("id", ParseIntPipe) id: number) {
    return this.categoryService.remove(id, req);
  }
}
