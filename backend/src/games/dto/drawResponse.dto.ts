import { IsBoolean, IsNumber } from 'class-validator';
export class DrawResponseDto {
  @IsNumber()
  gameId!: number;
  responsedById!: number;

  @IsBoolean()
  response!: boolean;
}
