import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import config from "./config";
import { AllExceptionsFilter } from "./common/error/error-handler";

async function start() {
  const PORT = config.PORT;
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "debug", "warn"],
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Mini e-commerce")
    .setVersion("1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        description: "Enter token",
        in: "header",
      },
      "JWT-auth"
    )
    .addSecurityRequirements("JWT-auth")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(PORT, () => {
    console.log(`Server started at: http://localhost:${PORT}`);
    console.log(
      `Swagger documentation available at http://localhost:${PORT}/docs`
    );
  });
}
start();
