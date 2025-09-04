import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = "Something went wrong";
    let error = "Bad Request";

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === "object" &&
        exceptionResponse !== null
      ) {
        const messageFromResponse = (exceptionResponse as any).message;
        const errorFromResponse = (exceptionResponse as any).error;
        // Harqanday message'ning type string bo‘lishi uchun pastdagi code'ni comment'dan chiqaring
        // if (Array.isArray(messageFromResponse)) {
        //   message = messageFromResponse.join(", ");
        // } else {
        message = messageFromResponse || message;
        // }

        error = errorFromResponse || error;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }
    const error_response = {
      message: message,
      error: error,
      statusCode: status,
    };

    response.status(status).json(error_response);
  }
}
