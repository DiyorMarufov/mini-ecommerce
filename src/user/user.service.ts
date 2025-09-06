import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { FindOptionsWhere, Repository } from "typeorm";
import { Role } from "../common/enum";
import config from "src/config";
import { errorCatch } from "src/common/helpers/error-catch";
import { goodResponse } from "src/common/helpers/good-response";
import { Request } from "express";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdateUserByAdminDto } from "./dto/update-user-byAdmin-dto";
import { encrypt } from "../common/bcrypt";

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

  async findAll(req: Request) {
    const user = (req as any).user;
    let where: FindOptionsWhere<User> = {};
    if (user && "id" in user) {
      const id = user.id;
      const userData = await this.userRepo.findOne({ where: { id } });

      if (!userData) {
        throw new NotFoundException(`User not found`);
      }

      if (userData.role === "admin") {
        where.role = Role.USER;
      }
    }

    const allUsers = await this.userRepo.find({
      where,
      select: {
        address: true,
        email: true,
        fname: true,
        id: true,
        lname: true,
        role: true,
        isActive: true,
      },
    });

    return goodResponse(200, "Barcha users muvaffaqiyatli olindi", allUsers);
  }

  async findOne(id: number, req?: Request) {
    let where: FindOptionsWhere<User> = { id };
    if ((req as any).user.role === Role.ADMIN) {
      where.role = Role.USER;
    }
    const user = await this.userRepo.findOne({
      where,
      select: {
        address: true,
        email: true,
        fname: true,
        lname: true,
        id: true,
        role: true,
        isActive: true,
      },
    });
    if (!user) throw new NotFoundException(`${id} id'lik user topilmadi`);

    return goodResponse(200, `${id} id'lik user muvaffaqiyatli olindi`, user);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      const existsUser = await this.userRepo.findOne({ where: { id } });

      if (!existsUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const { affected } = await this.userRepo.update(id, updateUserDto);

      if (!affected) {
        throw new BadRequestException(`User with ID ${id} not updated`);
      }

      const updatedUser = await this.userRepo.findOne({ where: { id } });

      return goodResponse(200, "success", {
        id: updatedUser?.id,
        fname: updatedUser?.fname,
        lname: updatedUser?.lname,
        address: updatedUser?.address,
        email: updatedUser?.email,
      });
    } catch (error) {
      return errorCatch(error);
    }
  }

  async updateUserRole(id: number, updateUserByAdminDto: UpdateUserByAdminDto) {
    try {
      const existsUser = await this.userRepo.findOne({ where: { id } });
      if (!existsUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const { affected } = await this.userRepo.update(id, {
        ...updateUserByAdminDto,
        isActive: true,
      });

      if (!affected) {
        throw new BadRequestException(`User with ID ${id} not updated`);
      }

      const updatedUser = await this.userRepo.findOne({ where: { id } });

      return goodResponse(200, "success", updatedUser);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async deleteUser(id: number) {
    try {
      const existsUser = await this.userRepo.findOne({ where: { id } });

      if (!existsUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      await this.userRepo.delete(id);
      return goodResponse(200, "success", {});
    } catch (error) {
      return errorCatch(error);
    }
  }
}
