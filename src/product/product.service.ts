import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { FindOptionsOrder, Repository } from "typeorm";
import { CategoryService } from "../category/category.service";
import { goodResponse } from "../common/helpers/good-response";
import { ProductOrderOptions, Role } from "../common/enum";
import { IRequest } from "../common/types";
import * as path from "path";
import { removeFilesSafe } from "../common/utils/file-delete.util";

@Injectable()
export class ProductService {
  private readonly uploadDir = path.join(process.cwd(), "uploads"); // yoki ConfigService’dan oling

  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    private readonly categoryService: CategoryService
  ) {}

  async create(req: IRequest, createProductDto: CreateProductDto) {
    const { categoryId, images, price } = createProductDto;
    await this.categoryService.findOne(categoryId);

    const newProduct = await this.productRepo.save({
      ...createProductDto,
      images: images || [],
      userId: req.user.id,
      price: Number(price),
    });

    return goodResponse(
      201,
      "Product muvaffaqiyatli qo‘shildi",
      newProduct,
      "newProduct"
    );
  }

  async findAll(
    skip: number = 0,
    limit: number = 30,
    orderOption: ProductOrderOptions = "latest"
  ) {
    let order: FindOptionsOrder<Product> = {};

    switch (orderOption) {
      case "latest":
        order = { createdAt: "desc" };
        break;
      case "cheapest":
        order = { price: "asc" };
        break;
      case "expensive":
        order = { price: "desc" };
        break;
      default:
        order = { createdAt: "desc" };
        break;
    }

    const [allProducts, total] = await this.productRepo.findAndCount({
      order,
      relations: { category: true, user: true },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        stock: true,
        brand: true,
        images: true,
        createdAt: true,
        user: {
          id: true,
          fname: true,
          email: true,
        },
        category: {
          id: true,
          name: true,
        },
      },
      skip,
      take: limit,
    });

    return goodResponse(
      200,
      "Barcha products muvaffaqiyatli olindi",
      {
        allProducts,
        total,
        skip,
        limit,
      },
      "data"
    );
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { category: true, user: true },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        stock: true,
        brand: true,
        images: true,
        user: {
          id: true,
          fname: true,
          email: true,
        },
        category: {
          id: true,
          name: true,
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`${id} id'lik product topilmadi`);
    }

    return goodResponse(
      200,
      `${id} id'lik product muvaffaqiyatli olindi`,
      product,
      "product"
    );
  }

  async update(id: number, updateProductDto: UpdateProductDto, req: IRequest) {
    const { images, categoryId } = updateProductDto;

    const { data: product } = await this.findOne(id);

    if (req.user.role === Role.ADMIN) {
      const userId = req.user.id;
      if (product.user.id != userId)
        throw new ForbiddenException(
          `Admin faqat o‘zi qo‘shgan product'ni yangilay oladi`
        );
    }

    const updated = { ...product, ...updateProductDto };
    if (images && images.length > 0) {
      updated.images = images;
    }

    await this.categoryService.findOne(Number(categoryId));

    await this.productRepo.save(updated);

    return goodResponse(
      200,
      `${id} id'lik product muvaffaqiyatli yangilandi`,
      id,
      "updatedProductId"
    );
  }

  async remove(id: number, req: IRequest) {
    const { data: product } = await this.findOne(id);

    if (req.user.role === Role.ADMIN) {
      const userId = req.user.id;

      if (product.user.id != userId)
        throw new ForbiddenException(
          `Admin faqat o‘zi qo‘shgan product'ni o‘chira oladi`
        );
    }
    const filesReport = await removeFilesSafe(
      product.images ?? [],
      this.uploadDir
    );

    await this.productRepo.remove(product);

    return goodResponse(
      200,
      `${id} lik product muvaffaqiyatli o‘chirildi`,
      {
        id,
        files: filesReport,
      },
      "deletedProduct"
    );
  }

  async removeAll() {
    const { affected } = await this.productRepo.deleteAll();

    return goodResponse(
      200,
      `Barcha product'lar o‘chirildi`,
      affected,
      "numberOfDeletedProducts"
    );
  }
}
