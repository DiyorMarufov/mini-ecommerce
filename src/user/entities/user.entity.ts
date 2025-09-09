import { Role } from "src/common/enum";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "../../common/db/base-entity";
import { Product } from "../../product/entities/product.entity";
import { Category } from "../../category/entities/category.entity";

@Entity()
export class User extends BaseEntity {
  @Column({ name: "fname", type: "varchar" })
  fname: string;

  @Column({ name: "lname", type: "varchar", nullable: true })
  lname?: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ name: "address", type: "varchar", nullable: true })
  address?: string;

  @Column({ name: "email", type: "varchar", unique: true })
  email: string;

  @Column({ name: "password", type: "varchar", select: false })
  password: string;

  @Column({ name: "role", type: "enum", enum: Role, default: Role.USER })
  role: Role;

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];
}
