import {
  ConflictException,
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

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>
  ) {}
  async create(createCategoryDto: CreateCategoryDto, req: Request) {
    const { name } = createCategoryDto;
    const errors = await checkUniqueFields(
      this.categoryRepo,
      { name },
      "category"
    );
    if (errors.length > 0) throw new ConflictException(errors);

    const newCategory = await this.categoryRepo.save({
      ...createCategoryDto,
      userId: (req as any).user.id,
    });

    return goodResponse(201, "Category muvaffaqiyatli qo‘shildi", newCategory);
  }

  async findAll() {
    const allCategories = await this.categoryRepo.find({
      order: {
        createdAt: "asc",
      },
      relations: { user: true },
      select: {
        user: { lname: true, fname: true, email: true },
      },
    });

    return goodResponse(
      200,
      "Barcha category muvaffaqiyatli olindi",
      allCategories
    );
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: { user: true },
      select: {
        user: { lname: true, fname: true, email: true },
      },
    });
    if (!category)
      throw new NotFoundException(`${id} id'lik category topilmadi`);

    return goodResponse<typeof category>(
      200,
      `${id} id'lik category muvaffaqiyatli olindi`,
      category
    );
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const { data } = await this.findOne(id);
    const { name } = updateCategoryDto;

    if (data.name === name) {
      return goodResponse(
        304,
        `${id} id'lik category muvaffaqiyatli yangilandi`,
        data
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
      updatedCategory
    );
  }

  async remove(id: number) {
    const { data } = await this.findOne(id);

    await this.categoryRepo.remove(data);

    return goodResponse(
      200,
      `${id} id'lik category muvaffaqiyatli o‘chirildi`,
      data
    );
  }
}
