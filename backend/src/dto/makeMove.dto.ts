import { IsString } from "class-validator";

export class MakeMoveDto {
  @IsString()
  from: string;
  to: string;
}
