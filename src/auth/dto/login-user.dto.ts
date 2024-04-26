import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator'

export class LoginUserDto {
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
