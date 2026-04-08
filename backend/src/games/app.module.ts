import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module';
import { GameGateway } from './app.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [AppService, GameGateway],
})
export class AppModule {}
