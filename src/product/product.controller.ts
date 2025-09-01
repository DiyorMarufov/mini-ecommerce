import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Res,
} from "@nestjs/common";
import { UseInterceptors, UploadedFiles } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { multerConfig } from "../config/multer.config";
import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ApiConsumes } from "@nestjs/swagger";
import { Response } from "express";

@Controller("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiConsumes("multipart/form-data")
  @Post()
  @UseInterceptors(FilesInterceptor("images", 10, multerConfig))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    console.log(createProductDto);
    let imageFilenames: null | string[] = null;
    if (files && files?.length > 0) {
      imageFilenames = files?.map((file) => file.filename) || [];
    }
    return this.productService.create({
      ...createProductDto,
      images: imageFilenames,
    });
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get("image/:filename")
  async getImage(@Param("filename") filename: string, @Res() res: Response) {
    console.log(filename);
    return res.sendFile(filename, { root: "./uploads" });
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @ApiConsumes("multipart/form-data")
  @Patch(":id")
  @UseInterceptors(FilesInterceptor("images", 10, multerConfig))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {

    const imageFilenames = files?.map((file) => file.filename) || [];
    return this.productService.update(id, {
      ...updateProductDto,
      images: imageFilenames,
    });
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
