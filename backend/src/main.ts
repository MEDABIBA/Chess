import { NestFactory } from "@nestjs/core";
import { AppModule } from "./games/app.module";
import { ValidationPipe } from "@nestjs/common";
import cors from "cors";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.use(cors({ origin: "http://localhost:3000" }));
  await app.listen(process.env.PORT ?? 3030);
}
bootstrap();
