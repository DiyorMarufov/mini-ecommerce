import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/db/base-entity";
import { Category } from "../../category/entities/category.entity";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Product extends BaseEntity {
  @ApiProperty({ type: "string", example: "Desk", description: "Product nomi" })
  @Column()
  title: string;

  @ApiProperty({
    type: "string",
    example: "Dars va ofis ishlari uchun mo‘ljallangan",
    description: "Product uchun ta'rif",
  })
  @Column({ type: "text" })
  description: string;

  @ApiProperty({
    type: "number",
    example: 300,
    description: "Product narxi(USD)",
  })
  @Column({
    type: "decimal",
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  price: number;

  @ApiProperty({
    type: "number",
    description: "Product category id'si",
    example: 1,
  })
  @Column()
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: "CASCADE",
    nullable: false,
  })
  category: Category;

  @ApiProperty({
    type: "number",
    description: "Product'ni qo‘shgan user id'si",
    example: 1,
  })
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.products, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  user: User;

  @ApiProperty({
    type: "array",
    items: { type: "string" },
    description: "Array'da image ulr'larini qaytariladi",
    nullable: true,
  })
  @Column("text", { array: true, default: [], nullable: true })
  images?: string[];

  @ApiProperty({ type: "number", example: 17, description: "Product soni" })
  @Column()
  stock: number;

  @ApiProperty({
    type: "string",
    example: "Dafna",
    description: "Product brandi",
    nullable: true,
  })
  @Column({ nullable: true })
  brand?: string;
}
