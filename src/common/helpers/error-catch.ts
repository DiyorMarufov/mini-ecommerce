import { HttpException, InternalServerErrorException } from '@nestjs/common';

export const errorCatch = (err: any) => {
  if (err?.response) {
    throw new HttpException(err?.response?.message, err?.response?.statusCode);
  }
  throw new InternalServerErrorException(err.message);
};
