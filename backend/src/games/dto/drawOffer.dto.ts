import { IsNumber } from 'class-validator';
export class DrawOfferDto {
  @IsNumber()
  gameId: number;
}
