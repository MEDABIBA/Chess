import { IsBoolean, IsNumber } from 'class-validator';
export class DrawResponseDto {
  @IsNumber()
  gameId!: number;

  @IsBoolean()
  response!: boolean;
}
