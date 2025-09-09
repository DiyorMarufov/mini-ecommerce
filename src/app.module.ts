import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user.module";
import { CategoryModule } from "./category/category.module";
import { ProductModule } from "./product/product.module";
import config from "./config";
import { JwtModule } from "@nestjs/jwt";
import { ServeStaticModule } from "@nestjs/serve-static";
import { resolve } from "path";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "postgres",
      autoLoadEntities: true,
      synchronize: true,
      url: config.DB_URL,
      // logging: ["query", "error"],
      dropSchema: false,
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve(__dirname, "..", "uploads"),
      serveRoot: "/uploads",
    }),
    JwtModule.register({ global: true }),
    AuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
  ],
})
export class AppModule {}
