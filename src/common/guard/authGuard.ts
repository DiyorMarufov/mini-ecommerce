import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import config from "src/config";
import { Payload } from "../types/payload.type";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers?.authorization;

    if (!auth) {
      throw new UnauthorizedException("Authorization header not found");
    }

    const [bearer, token] = auth.split(" ");

    if (bearer !== "Bearer" || !token) {
      throw new UnauthorizedException("Invalid token format");
    }

    try {
      const user: Payload = this.jwtService.verify(token, {
        secret: config.ACCESS_TOKEN_KEY,
      });

      req.user = user;
      console.log(user);
      return true;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new UnauthorizedException("Token expired");
      } else if (error.name === "JsonWebTokenError") {
        throw new UnauthorizedException("Invalid token");
      }
      throw new UnauthorizedException("Unauthorized");
    }
  }
}
