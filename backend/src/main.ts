import { NestFactory } from "@nestjs/core";
import { AppModule } from "./games/app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";

async function bootstrap() {
  // Catch the exceptions
  // @Catch(WsException)
  // class WsExceptionFilter implements ExceptionFilter {
  //   catch(exception: WsException, host: ArgumentsHost) {
  //     const client = host.switchToWs().getClient();
  //     client.emit("error", { message: exception.message });
  //   }
  // }

  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });
  app.use(cookieParser());
  // app.useGlobalFilters(new WsExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3030);
}
bootstrap();
