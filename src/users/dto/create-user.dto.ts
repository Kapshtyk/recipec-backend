import { ApiProperty } from "@nestjs/swagger";

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
} from "class-validator";

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 20)
  @ApiProperty({ type: String, example: "user", description: "Username" })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    type: String,
    example: "test@email.com",
    description: "Email",
  })
  email: string;

  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minNumbers: 1,
  })
  @ApiProperty({ type: String, example: "123456", description: "Password" })
  password: string;
}
