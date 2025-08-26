import { Category } from "../../category/entities/category.entity";

export class CreateProductDto {
  title: string;

  description: string;

  price: number;

  categoryId: number;

  images: string;

  stock: number;

  brand: string;
}
