import { IsString } from 'class-validator';

export class joinGameByCodeDto {
  @IsString()
  username: string;

  @IsString()
  code: string;
}
