import { ApiProperty } from "@nestjs/swagger";

export class TokenDto {
  @ApiProperty({ example: "Bearer token", description: "Token" })
  token: string;
}
