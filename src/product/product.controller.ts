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
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { Response } from 'express';
import { checkRoles } from 'src/common/decorator/rolesDecorator';
import { Role } from 'src/common/enum';
import { AuthGuard } from 'src/common/guard/authGuard';
import { AdminGuard } from 'src/common/guard/adminGuard';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  @checkRoles(Role.OWNER, Role.ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  @ApiResponse({ status: 201, description: 'Product successfully created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    let imageFilenames: null | string[] = null;
    if (files && files.length > 0) {
      imageFilenames = files.map((file) => file.filename);
    }
    return this.productService.create({
      ...createProductDto,
      images: imageFilenames,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of products' })
  findAll() {
    return this.productService.findAll();
  }

  @Get('image/:filename')
  @ApiOperation({ summary: 'Get product image by filename' })
  @ApiResponse({ status: 200, description: 'Image retrieved' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(filename, { root: './uploads' });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @checkRoles(Role.OWNER, Role.ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  @ApiOperation({ summary: 'Update product by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const imageFilenames = files?.map((file) => file.filename) || [];
    return this.productService.update(id, {
      ...updateProductDto,
      images: imageFilenames,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  @checkRoles(Role.OWNER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete product by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
