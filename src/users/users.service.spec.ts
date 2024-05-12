/* eslint-disable @typescript-eslint/unbound-method */
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";

import * as dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { Model } from "mongoose";

import { CreateUserDto } from "./dto/create-user.dto";
import {
  User,
  UserDbShort,
  UserDbWithPassword,
  UserDocument,
} from "./schemas/users.schema";
import { UsersService } from "./users.service";

dotenv.config({ path: ".test.env" });

describe("UsersService", () => {
  let service: UsersService;
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            find: jest.fn(),
            findByIdAndRemove: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      const createUserDto: CreateUserDto = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };
      const createdUser: UserDbShort = {
        _id: new ObjectId("60d6c7e320f9b53d8c63ada5"),
        email: createUserDto.email,
        username: createUserDto.username,
      };
      jest.spyOn(userModel, "create").mockResolvedValue(createdUser as any);
      jest.spyOn(service, "getOneUser").mockResolvedValue(createdUser);

      const result = await service.createUser(createUserDto);

      expect(userModel.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createdUser);
    });
  });

  describe("getOneUser", () => {
    it("should return a user by id", async () => {
      const userId = "60d6c7e320f9b53d8c63ada5";
      const user: UserDbShort = {
        _id: new ObjectId(userId),
        email: "test@example.com",
        username: "testuser",
      };
      jest.spyOn(userModel, "findById").mockResolvedValue(user);

      const result = await service.getOneUser(userId);

      expect(userModel.findById).toHaveBeenCalledWith(userId, {
        username: 1,
        email: 1,
        _id: 1,
      });
      expect(result).toEqual(user);
    });
  });

  describe("getAllUsers", () => {
    it("should return all users", async () => {
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
      jest.spyOn(userModel, "find").mockResolvedValue(users);

      const result = await service.getAllUsers();

      expect(userModel.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe("removeUser", () => {
    it("should remove a user by id", async () => {
      const userId = "60d6c7e320f9b53d8c63ada5";
      jest.spyOn(userModel, "findByIdAndRemove").mockResolvedValue(null);

      const result = await service.removeUser(userId);

      expect(userModel.findByIdAndRemove).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ message: "User was deleted" });
    });
  });

  describe("getUserByEmail", () => {
    it("should return a user by email", async () => {
      const email = "test@example.com";
      const user: UserDbWithPassword = {
        _id: new ObjectId("60d6c7e320f9b53d8c63ada5"),
        email,
        username: "testuser",
        password: "password123",
      };
      jest.spyOn(userModel, "findOne").mockResolvedValue(user);

      const result = await service.getUserByEmail(email);

      expect(userModel.findOne).toHaveBeenCalledWith(
        { email },
        { username: 1, email: 1, _id: 1, password: 1 },
      );
      expect(result).toEqual(user);
    });
  });

  describe("checkIfUserExists", () => {
    it("should return true if user exists by email or username", async () => {
      const email = "test@example.com";
      const username = "testuser";
      const user: UserDbShort = {
        _id: new ObjectId("60d6c7e320f9b53d8c63ada5"),
        email: "test@example.com",
        username: "testuser",
      };
      jest.spyOn(userModel, "findOne").mockResolvedValue(user);

      const resultByEmail = await service.checkIfUserExists(email, "otheruser");
      const resultByUsername = await service.checkIfUserExists(
        "other@example.com",
        username,
      );
      const resultByBoth = await service.checkIfUserExists(email, username);

      expect(userModel.findOne).toHaveBeenCalledWith({ email });
      expect(userModel.findOne).toHaveBeenCalledWith({ username });
      expect(resultByEmail).toBe(true);
      expect(resultByUsername).toBe(true);
      expect(resultByBoth).toBe(true);
    });
  });
});
