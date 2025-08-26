import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/db/base-entity";
import { ApiProperty } from "@nestjs/swagger";
import { Product } from "../../product/entities/product.entity";

@Entity()
export class Category extends BaseEntity {
  @ApiProperty({ type: "string", example: "furniture" })
  @Column({ unique: true })
  name: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
