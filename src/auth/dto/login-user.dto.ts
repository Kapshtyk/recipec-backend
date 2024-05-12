import { ApiProperty } from "@nestjs/swagger";

import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginUserDto {
  @ApiProperty({ example: "test@email.com", description: "Email" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: "123456", description: "Password" })
  @IsNotEmpty()
  password: string;
}
