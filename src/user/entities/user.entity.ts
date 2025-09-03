import { Role } from "src/common/enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "fname", type: "varchar" })
  fname: string;

  @Column({ name: "lname", type: "varchar", nullable: true })
  lname?: string;

  @Column({ name: "address", type: "varchar", nullable: true })
  address?: string;

  @Column({ name: "email", type: "varchar", unique: true })
  email: string;

  @Column({ name: "password", type: "varchar" })
  password: string;

  @Column({ name: "role", type: "enum", enum: Role, default: Role.USER })
  role: Role;
}
