/* eslint-disable @typescript-eslint/unbound-method */
import {
  BadRequestException,
  UnauthorizedException,
  ValidationPipe,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";

import { CreateUserDto } from "../users/dto/create-user.dto";
import { UsersService } from "../users/users.service";

import { LoginUserDto } from "./dto/login-user.dto";
import { TokenDto } from "./dto/token.dto";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        JwtService,
        {
          provide: AuthService,
          useValue: {
            registration: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            checkIfUserExists: jest.fn(),
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe("login", () => {
    it("should call authService.login and return the result", async () => {
      const dto: LoginUserDto = {
        email: "test@example.com",
        password: "password123",
      };
      const expectedResult: TokenDto = {
        token: "testtoken",
      };
      jest.spyOn(authService, "login").mockResolvedValue(expectedResult);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it("should throw an error if the user does not exist", async () => {
      const dto: LoginUserDto = {
        email: "test@example.com",
        password: "password123",
      };
      jest
        .spyOn(authService, "login")
        .mockRejectedValue(new UnauthorizedException());

      const result = controller.login(dto);

      await expect(result).rejects.toThrowError(UnauthorizedException);
    });

    it("should throw an error if used data is incorrect", async () => {
      const validationPipe = new ValidationPipe();

      const userWithoutEmail = {
        password: "password123",
      };

      jest.spyOn(authService, "login");

      await expect(
        validationPipe
          .transform(userWithoutEmail, {
            type: "body",
            metatype: CreateUserDto,
          })
          .then(() => controller.login(userWithoutEmail as any)),
      ).rejects.toThrow(BadRequestException);

      expect(authService.login).not.toHaveBeenCalled();

      const userWithoutPassword = {
        email: "test@example.com",
      };

      await expect(
        validationPipe
          .transform(userWithoutPassword, {
            type: "body",
            metatype: CreateUserDto,
          })
          .then(() => controller.login(userWithoutEmail as any)),
      ).rejects.toThrow(BadRequestException);

      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe("registration", () => {
    it("should call authService.registration and return the result", async () => {
      const dto: CreateUserDto = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };
      const expectedResult: TokenDto = {
        token: "testtoken",
      };
      jest.spyOn(authService, "registration").mockResolvedValue(expectedResult);

      const result = await controller.registration(dto);

      expect(authService.registration).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });
  });

  it("should throw an error if the user already exists", async () => {
    const dto: CreateUserDto = {
      email: "test@example.com",
      username: "testuser",
      password: "password123",
    };
    jest
      .spyOn(authService, "registration")
      .mockRejectedValue(new BadRequestException());

    await expect(() => controller.registration(dto)).rejects.toThrowError(
      BadRequestException,
    );

    expect(authService.registration).toHaveBeenCalledWith(dto);
  });

  it("should throw an error if used data is incorrect", async () => {
    const validationPipe = new ValidationPipe();

    const userWithoutEmail = {
      username: "testuser",
      password: "password123",
    };

    jest.spyOn(authService, "registration");

    await expect(
      validationPipe
        .transform(userWithoutEmail, { type: "body", metatype: CreateUserDto })
        .then(() => controller.registration(userWithoutEmail as any)),
    ).rejects.toThrow(BadRequestException);

    expect(authService.registration).not.toHaveBeenCalled();

    const userWithoutPassword = {
      email: "test@example.com",
      username: "testuser",
    };

    await expect(
      validationPipe
        .transform(userWithoutPassword, {
          type: "body",
          metatype: CreateUserDto,
        })
        .then(() => controller.registration(userWithoutPassword as any)),
    ).rejects.toThrow(BadRequestException);

    expect(authService.registration).not.toHaveBeenCalled();

    const userWithoutUsername = {
      email: "test@example.com",
      password: "password123",
    };

    await expect(
      validationPipe
        .transform(userWithoutUsername, {
          type: "body",
          metatype: CreateUserDto,
        })
        .then(() => controller.registration(userWithoutUsername as any)),
    ).rejects.toThrow(BadRequestException);

    expect(authService.registration).not.toHaveBeenCalled();
  });

  it("should not allow registration with weak passwords", async () => {
    const weakPasswords = [
      "12345",
      "password",
      "PASSWORD",
      "Password",
      "Password1",
    ];
    const validationPipe = new ValidationPipe();

    for (const password of weakPasswords) {
      const userWithWeakPassword = {
        username: "testuser",
        email: "test@example.com",
        password,
      };

      await expect(
        validationPipe
          .transform(userWithWeakPassword, {
            type: "body",
            metatype: CreateUserDto,
          })
          .then(() => controller.registration(userWithWeakPassword as any)),
      ).rejects.toThrow(BadRequestException);

      expect(authService.registration).not.toHaveBeenCalled();
    }
  });
});
