import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../common/db/base-entity";

@Entity()
export class Otp extends BaseEntity {
  @Column()
  email: string;

  @Column()
  otp: string;

  @Column()
  expiration_time: Date;

  @Column({ default: false })
  verified: boolean;
}
