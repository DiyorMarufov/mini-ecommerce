import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import config from 'src/config';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken = async (payload: object) => {
    return this.jwtService.signAsync(payload, {
      secret: config.ACCESS_TOKEN_KEY,
      expiresIn: config.ACCESS_TOKEN_TIME,
    });
  };

  generateRefreshToken = async (payload: object) => {
    return this.jwtService.signAsync(payload, {
      secret: config.REFRESH_TOKEN_KEY,
      expiresIn: config.REFRESH_TOKEN_TIME,
    });
  };

  verifyAccessToken = async (accessToken: string) => {
    return this.jwtService.verify(accessToken, {
      secret: config.ACCESS_TOKEN_KEY,
    });
  };

  verifyRefreshToken = async (refreshToken: string) => {
    return this.jwtService.verify(refreshToken, {
      secret: config.REFRESH_TOKEN_KEY,
    });
  };
}
