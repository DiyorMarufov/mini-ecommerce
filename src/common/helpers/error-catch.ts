import { HttpException, InternalServerErrorException } from "@nestjs/common";

export const errorCatch = (err: any) => {
  console.log(err);
  if (err?.response) {
    throw new HttpException(err?.response?.message, err?.response?.statusCode);
    // throw new HttpException(JSON.stringify(err), 400);
  }
  throw new InternalServerErrorException(JSON.stringify(err));
};
