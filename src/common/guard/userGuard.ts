import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Role } from "../enum";

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(
    ctx: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { user, params } = ctx.switchToHttp().getRequest();
    if (user.role === Role.OWNER) {
      return true;
    }
    if (user.role === Role.ADMIN) {
      return true;
    }

    if (user.role === Role.USER && user.id === Number(params.id)) {
      return true;
    }
    throw new ForbiddenException(`Forbidden user with role ${user.role}`);
  }
}
