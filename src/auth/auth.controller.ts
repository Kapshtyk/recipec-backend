import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { CreateUserDto } from 'src/users/dto/create-user.dto'

import { AuthService } from './auth.service'
import { AuthResponseDto } from './dto/auth-token.dto'
import { ErrorDto } from './dto/error.dto'
import { LoginUserDto } from './dto/login-user.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @ApiResponse({ status: 201, description: 'Success', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto })
  @Post('login')
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto)
  }

  @ApiOperation({ summary: 'Registration' })
  @ApiResponse({ status: 201, description: 'Success', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorDto })
  @Post('registration')
  registration(@Body() dto: CreateUserDto) {
    return this.authService.registration(dto)
  }
}
