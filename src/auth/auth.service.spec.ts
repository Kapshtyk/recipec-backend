/* eslint-disable @typescript-eslint/unbound-method */
import { HttpException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";

import { CreateUserDto } from "../users/dto/create-user.dto";
import { UserDocument } from "../users/schemas/users.schema";
import { UsersService } from "../users/users.service";

import { LoginUserDto } from "./dto/login-user.dto";
import { TokenDto } from "./dto/token.dto";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("token"),
          },
        },
        {
          provide: UsersService,
          useValue: {
            checkIfUserExists: jest.fn(),
            createUser: jest.fn(),
            getUserByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe("login", () => {
    it("should return a token when valid credentials are provided", async () => {
      const dto: LoginUserDto = {
        email: "test@example.com",
        password: "password123",
      };
      const user: TokenDto = {
        token: "testtoken",
      };
      const generateTokenSpy = jest
        .spyOn(authService, "generateToken")
        .mockReturnValue({ token: "testtoken" });
      const validateUserSpy = jest
        .spyOn(authService as any, "validateUser")
        .mockResolvedValue(user);

      const result = await authService.login(dto);

      expect(validateUserSpy).toHaveBeenCalledWith(dto);
      expect(generateTokenSpy).toHaveBeenCalledWith(user);
      expect(result).toEqual({ token: "testtoken" });
    });

    it("should throw an UnauthorizedException when invalid credentials are provided", async () => {
      const dto: LoginUserDto = {
        email: "test@example.com",
        password: "password123",
      };
      const validateUserSpy = jest
        .spyOn(authService as any, "validateUser")
        .mockResolvedValue(null);

      await expect(authService.login(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(validateUserSpy).toHaveBeenCalledWith(dto);
    });
  });

  describe("registration", () => {
    it("should create a new user and return the user with a token", async () => {
      const dto: CreateUserDto = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };
      const user = {
        email: "test@example.com",
        username: "testuser",
        password: "hashedPassword",
        _id: "1234567890",
      };
      const checkIfUserExistsSpy = jest
        .spyOn(usersService, "checkIfUserExists")
        .mockResolvedValue(false);
      const createUserSpy = jest
        .spyOn(usersService, "createUser")
        .mockResolvedValue(user as unknown as UserDocument);
      const generateTokenSpy = jest
        .spyOn(authService, "generateToken")
        .mockReturnValue({ token: "testtoken" });

      const result = await authService.registration(dto);

      expect(checkIfUserExistsSpy).toHaveBeenCalledWith(
        dto.email,
        dto.username,
      );
      expect(createUserSpy).toHaveBeenCalledWith({
        ...dto,
        password: expect.any(String),
      });
      expect(generateTokenSpy).toHaveBeenCalledWith(user);
      expect(result).toEqual({ token: "testtoken" });
    });

    it("should throw an HttpException when user with the same email or username already exists", async () => {
      const dto: CreateUserDto = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };
      const checkIfUserExistsSpy = jest
        .spyOn(usersService, "checkIfUserExists")
        .mockResolvedValue(true);

      await expect(authService.registration(dto)).rejects.toThrow(
        HttpException,
      );
      expect(checkIfUserExistsSpy).toHaveBeenCalledWith(
        dto.email,
        dto.username,
      );
    });
  });
});
