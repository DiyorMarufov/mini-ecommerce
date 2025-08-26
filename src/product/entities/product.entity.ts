import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/db/base-entity";
import { Category } from "../../category/entities/category.entity";

@Entity()
export class Product extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column()
  price: number;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: "CASCADE",
  })
  category: Category;

  @Column({ type: "text" })
  images: string;

  @Column()
  stock: number;

  @Column()
  brand: string;
}
