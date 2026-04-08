import { IsNumber, IsString } from 'class-validator';

export class JoinGameDto {
  @IsNumber()
  id!: number;

  @IsString()
  username!: string;
}
