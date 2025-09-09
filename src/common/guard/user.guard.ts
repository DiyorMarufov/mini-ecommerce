import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Role } from "../enum";
import { IRequest } from "../types";

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(
    ctx: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { user, params }: IRequest = ctx.switchToHttp().getRequest();
    if (user.role === Role.OWNER) {
      return true;
    }

    if (user.id === Number(params.id)) {
      return true;
    }

    throw new ForbiddenException(
      `Siz faqat o‘z ma'lumotlaringzni olishingiz va o‘zgartirishgiz mumkin`
    );
  }
}
