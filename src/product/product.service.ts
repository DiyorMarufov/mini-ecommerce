import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { Repository } from "typeorm";
import { CategoryService } from "../category/category.service";
import { goodResponse } from "../common/helpers/good-response";
import { Request } from "express";

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    private readonly categoryService: CategoryService
  ) {}
  async create(req: Request, createProductDto: CreateProductDto) {
    const { categoryId, images } = createProductDto;
    await this.categoryService.findOne(categoryId);

    const newProduct = await this.productRepo.save({
      ...createProductDto,
      images: images || [],
      userId: (req as any).user.id,
    });

    return goodResponse(201, "Product muvaffaqiyatli qo‘shildi", newProduct);
  }

  async findAll() {
    const allProducts = await this.productRepo.find({
      relations: { category: true },
    });

    return goodResponse(
      200,
      "Barcha products muvaffaqiyatli olindi",
      allProducts
    );
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) {
      throw new NotFoundException(`${id} id'lik product topilmadi`);
    }

    return goodResponse(
      200,
      `${id} id'lik product muvaffaqiyatli olindi`,
      product
    );
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { images, categoryId } = updateProductDto;
    const { data: product } = await this.findOne(id);
    const updated = { ...product, ...updateProductDto };
    if (images && images.length > 0) {
      updated.images = images;
    }

    await this.categoryService.findOne(Number(categoryId));

    await this.productRepo.save(updated);

    return goodResponse(
      200,
      `${id} id'lik product muvaffaqiyatli yangilandi`,
      updated
    );
  }

  async remove(id: number) {
    const { data: product } = await this.findOne(id);
    await this.productRepo.remove(product);

    return goodResponse(
      200,
      `${id} lik product muvaffaqiyatli o‘chirildi`,
      product
    );
  }
}
