import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcryptjs'
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { User, UserDocument } from 'src/users/schemas/users.schema'
import { UsersService } from 'src/users/users.service'

import { LoginUserDto } from './dto/login-user.dto'

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(dto: LoginUserDto) {
    const user = await this.validateUser(dto)
    return this.generateToken(user)
  }

  async registration(dto: CreateUserDto): Promise<{ token: string }> {
    // TODO: delete this
    await this.userService.clear()
    const candidate = await this.userService.getUserByEmail(dto.email)
    if (candidate) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST
      )
    }
    const hashPassword = await hash(dto.password, 5)
    const user = await this.userService.createUser({
      ...dto,
      password: hashPassword
    })
    return this.generateToken(user)
  }

  async generateToken(user: UserDocument): Promise<{ token: string }> {
    const payload = { email: user.email, username: user.username, id: user._id }
    return {
      token: this.jwtService.sign(payload)
    }
  }

  private async validateUser(dto: LoginUserDto): Promise<UserDocument> {
    const user = await this.userService.getUserByEmail(dto.email)
    const passwordEquals = await compare(dto.password, user.password)
    if (user && passwordEquals) {
      return user
    }
    throw new UnauthorizedException({
      message: 'Incorrect email or password'
    })
  }
}
