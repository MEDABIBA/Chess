import { IsNumber } from 'class-validator';

export class removeGameDto {
  @IsNumber()
  gameId: number;
  userId: number;
}
