import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { compare, hash } from "bcryptjs";

import { CreateUserDto } from "../users/dto/create-user.dto";
import { UserDbShort, UserDbWithPassword } from "../users/schemas/users.schema";
import { UsersService } from "../users/users.service";

import { LoginUserDto } from "./dto/login-user.dto";
import { TokenDto } from "./dto/token.dto";

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(userDto: LoginUserDto): Promise<TokenDto> {
    const user = await this.validateUser(userDto);

    if (!user) {
      throw new UnauthorizedException(
        "User with this email or password does not exist",
      );
    }

    return this.generateToken(user);
  }

  async registration(dto: CreateUserDto): Promise<TokenDto> {
    const candidate = await this.userService.checkIfUserExists(
      dto.email,
      dto.username,
    );
    if (candidate) {
      throw new BadRequestException(
        "User with this email or username already exists",
      );
    }

    const hashPassword = await hash(dto.password, 5);
    const user = await this.userService.createUser({
      ...dto,
      password: hashPassword,
    });
    const token = this.generateToken(user).token;
    return { token };
  }

  generateToken(user: UserDbShort): TokenDto {
    const payload = {
      email: user.email,
      username: user.username,
      id: user._id,
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  private async validateUser(dto: LoginUserDto): Promise<UserDbWithPassword> {
    const user = await this.userService.getUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException({
        message: "Incorrect email",
      });
    }
    const passwordEquals = await compare(dto.password, user.password);
    if (!passwordEquals) {
      throw new UnauthorizedException({
        message: "Incorrect password",
      });
    }
    return user;
  }
}
