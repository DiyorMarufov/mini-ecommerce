import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { FindOptionsWhere, Repository } from "typeorm";
import { Role } from "../common/enum";
import config from "src/config";
import { errorCatch } from "src/common/helpers/error-catch";
import { goodResponse } from "src/common/helpers/good-response";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateUserRoleDto } from "./dto/update-user-byAdmin-dto";
import { encrypt } from "../common/bcrypt";
import { IRequest } from "../common/types";

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}
  async onModuleInit(): Promise<void> {
    try {
      const isSuperAdmin = await this.userRepo.findOne({
        where: { role: Role.OWNER as unknown as Role.ADMIN },
      });
      if (!isSuperAdmin) {
        const hashedPassword = await encrypt(config.ADMIN_PASSWORD);
        const SUPER_ADMIN = this.userRepo.create({
          fname: config.ADMIN_FULL_NAME,
          email: config.ADMIN_EMAIL,
          password: hashedPassword,
          role: Role.OWNER,
          isActive: true,
        });
        await this.userRepo.save(SUPER_ADMIN);
      }
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll(req: IRequest) {
    const user = req.user;
    let where: FindOptionsWhere<User> = {};

    const id = user.id;
    const { data: userData } = await this.findOne(id);

    if (userData.role === Role.ADMIN) {
      where.role = Role.USER;
    }

    const allUsers = await this.userRepo.find({
      where,
      order: { createdAt: "asc" },
    });

    return goodResponse(
      200,
      "Barcha users muvaffaqiyatli olindi",
      allUsers,
      "allUsers"
    );
  }

  async findOne(id: number, req?: IRequest) {
    let where: FindOptionsWhere<User> = { id };
    if (req && req.user.role === Role.ADMIN) {
      where.role = Role.USER;
    }
    const user = await this.userRepo.findOne({ where });
    if (!user) throw new NotFoundException(`${id} id'lik user topilmadi`);

    return goodResponse(
      200,
      `${id} id'lik user muvaffaqiyatli olindi`,
      user,
      "user"
    );
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      const { data: user } = await this.findOne(id);
      const updatedUser = await this.userRepo.save({
        ...user,
        ...updateUserDto,
      });

      return goodResponse(200, "success", updatedUser, "updatedUser");
    } catch (error) {
      return errorCatch(error);
    }
  }

  async updateUserRole(id: number, updateUserRoleDto: UpdateUserRoleDto) {
    try {
      const { role } = updateUserRoleDto;
      const {
        raw: [updatedUser],
      } = await this.userRepo
        .createQueryBuilder()
        .update(User)
        .set({ role, isActive: true })
        .where("id = :id", { id })
        .returning("*")
        .execute();
      if (!updatedUser) {
        throw new NotFoundException(`${id} id'lik user topilmadi`);
      }

      return goodResponse(
        200,
        `${id} id'lik user role'i ${role}'ga o‘zgartirildi`,
        id,
        "updatedUserId"
      );
    } catch (error) {
      return errorCatch(error);
    }
  }

  async deleteUser(id: number) {
    try {
      const { affected } = await this.userRepo.delete({ id });
      if (!affected) throw new NotFoundException(`${id} id'lik user topilmadi`);

      return goodResponse(
        200,
        `${id} id'lik user muvaffaqiyatli o‘chirildi`,
        id,
        "deleteUserId"
      );
    } catch (error) {
      return errorCatch(error);
    }
  }
}
