import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/db/base-entity";
import { ApiProperty } from "@nestjs/swagger";
import { Product } from "../../product/entities/product.entity";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Category extends BaseEntity {
  @ApiProperty({ type: "string", example: "furniture" })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    type: "number",
    description: "Category'ni qo‘shgan user id'si",
    example: 1,
  })
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.categories, {
    onDelete: "CASCADE",
    nullable: false,
  })
  user: User;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
