import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import config from './config';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      autoLoadEntities: true,
      synchronize: true,
      url: config.DB_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve(__dirname, '..', '..', '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    JwtModule.register({ global: true }),
    UserModule,
    CategoryModule,
    ProductModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
