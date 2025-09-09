import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Repository } from "typeorm";
import { Category } from "./entities/category.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { goodResponse } from "../common/helpers/good-response";
import { checkUniqueFields } from "../common/helpers/check-unique-fields";
import { Request } from "express";
import { IRequest } from "../common/types";
import { Role } from "../common/enum";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>
  ) {}
  async create(createCategoryDto: CreateCategoryDto, req: IRequest) {
    const { name } = createCategoryDto;
    const errors = await checkUniqueFields(
      this.categoryRepo,
      { name },
      "category"
    );
    if (errors.length > 0) throw new ConflictException(errors);

    const newCategory = await this.categoryRepo.save({
      ...createCategoryDto,
      userId: req.user.id,
    });

    return goodResponse(
      201,
      "Category muvaffaqiyatli qo‘shildi",
      newCategory,
      "newCategory"
    );
  }

  async findAll() {
    const allCategories = await this.categoryRepo.find({
      order: {
        createdAt: "asc",
      },
      relations: { user: true },
      select: {
        id: true,
        name: true,
        user: { id: true, fname: true, email: true },
      },
    });

    return goodResponse(
      200,
      "Barcha category muvaffaqiyatli olindi",
      allCategories,
      "allCategories"
    );
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: { user: true },
      select: {
        id: true,
        name: true,
        user: { id: true, fname: true, email: true },
      },
    });
    if (!category)
      throw new NotFoundException(`${id} id'lik category topilmadi`);

    return goodResponse(
      200,
      `${id} id'lik category muvaffaqiyatli olindi`,
      category,
      "category"
    );
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    req: IRequest
  ) {
    const { data } = await this.findOne(id);

    if (req.user.role === Role.ADMIN) {
      const userId = req.user.id;
      if (data.user.id !== userId)
        throw new ForbiddenException(
          `Admin faqat o‘zi qo‘shgan category'ni yangilay oladi`
        );
    }
    const { name } = updateCategoryDto;

    if (data.name === name) {
      return goodResponse(
        304,
        `${id} id'lik category muvaffaqiyatli yangilandi`,
        data,
        "updatedCategory"
      );
    }

    const errors = await checkUniqueFields(
      this.categoryRepo,
      { name },
      "category"
    );
    if (errors.length > 0) throw new ConflictException(errors);

    const updatedCategory = await this.categoryRepo.save({ ...data, name });

    return goodResponse(
      200,
      `${id} id'lik category muvaffaqiyatli yangilandi`,
      updatedCategory,
      "updatedCategory"
    );
  }

  async remove(id: number, req: IRequest) {
    const { data } = await this.findOne(id);

    if (req.user.role === Role.ADMIN) {
      const userId = req.user.id;
      if (data.user.id !== userId)
        throw new ForbiddenException(
          `Admin faqat o‘zi qo‘shgan category'ni o‘chira oladi`
        );
    }
    await this.categoryRepo.remove(data);

    return goodResponse(
      200,
      `${id} id'lik category muvaffaqiyatli o‘chirildi`,
      data,
      "deletedCategory"
    );
  }
}
