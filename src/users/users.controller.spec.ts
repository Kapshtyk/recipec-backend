/* eslint-disable @typescript-eslint/unbound-method */
import { JwtService } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";

import { ObjectId } from "mongodb";

import { AuthService } from "../auth/auth.service";

import { User, UserDbShort } from "./schemas/users.schema";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

describe("UsersController", () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        AuthService,
        JwtService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: jest.fn(),
            find: jest.fn(),
            findByIdAndRemove: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe("getOne", () => {
    it("should call usersService.getOneUser and return the user", async () => {
      const userId = "60d6c7e320f9b53d8c63ada5";
      const user: UserDbShort = {
        _id: new ObjectId("60d6c7e320f9b53d8c63ada5"),
        email: "test@example.com",
        username: "testuser",
      };

      jest.spyOn(usersService, "getOneUser").mockResolvedValue(user);

      const result = await controller.getOne(userId);

      expect(usersService.getOneUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(user);
    });
  });

  describe("getAll", () => {
    it("should call usersService.getAllUsers and return all users", async () => {
      const users: UserDbShort[] = [
        {
          _id: new ObjectId("60d6c7e320f9b53d8c63ada5"),
          email: "test1@example.com",
          username: "testuser1",
        },
        {
          _id: new ObjectId("60d6c7e320f9b53d8c63ada4"),
          email: "test2@example.com",
          username: "testuser2",
        },
      ];
      jest.spyOn(usersService, "getAllUsers").mockResolvedValue(users);

      const result = await controller.getAll();

      expect(usersService.getAllUsers).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe("remove", () => {
    it("should call usersService.removeUser and return no content", async () => {
      const userId = "60d6c7e320f9b53d8c63ada5";
      jest
        .spyOn(usersService, "removeUser")
        .mockResolvedValue({ message: "User was deleted" });

      const result = await controller.remove(userId);

      expect(usersService.removeUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ message: "User was deleted" });
    });
  });
});
