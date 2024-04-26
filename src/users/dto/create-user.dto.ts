import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length
} from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ example: 'user', description: 'Username' })
  @IsNotEmpty()
  @IsString()
  @Length(3, 20)
  username: string

  @ApiProperty({ example: 'test@email.com', description: 'Email' })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({ example: '123456', description: 'Password' })
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 6,
    minUppercase: 1,
    minNumbers: 1
  })
  password: string
}
