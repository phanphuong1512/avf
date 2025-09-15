import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // bật validation cho tất cả DTO (class-validator, class-transformer)
  app.useGlobalPipes(
    new ValidationPipe({
      // tự động loại field thừa không có trong DTO
      whitelist: true,
      forbidNonWhitelisted: true, // báo lỗi nếu request chứa field không khai báo
      // tự động convert type (string → number, date…)
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // 👈 thêm dòng này
      },
    }),
  );

  // cho phép frontend gọi từ localhost và Cloudflare tunnel
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://alert-considering-receive-utilize.trycloudflare.com',
      /\.trycloudflare\.com$/,
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // (tùy chọn) prefix cho API: http://localhost:3001/api/...
  // app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001); // nên để 3001 cho BE, để tránh đụng FE
}
bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
