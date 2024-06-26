import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Model } from "mongoose";
import { IRequestWithUser } from "src/auth/auth.guard";

import { CreateUserDto } from "./dto/create-user.dto";
import { User, UserDbShort, UserDbWithPassword } from "./schemas/users.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userRepository: Model<User>) {}

  async createUser(dto: CreateUserDto): Promise<UserDbShort> {
    const user = await this.userRepository.create(dto);
    if (!user) {
      throw new InternalServerErrorException("User was not created");
    }
    return await this.getOneUser(user._id.toString());
  }

  async getOneUser(id: string): Promise<UserDbShort> {
    const user = await this.userRepository.findById(id, {
      username: 1,
      email: 1,
      _id: 1,
      roles: 1,
    });
    return user;
  }

  async getMe(req: IRequestWithUser): Promise<UserDbShort> {
    return this.getOneUser(req.user._id.toString());
  }

  async getAllUsers(): Promise<UserDbShort[]> {
    const users = await this.userRepository.find(
      {},
      { username: 1, email: 1, _id: 1, roles: 1 },
    );
    return users;
  }

  async removeUser(id: string): Promise<{ message: string }> {
    await this.userRepository.findByIdAndRemove(id);
    return { message: "User was deleted" };
  }

  async getUserByEmail(email: string): Promise<UserDbWithPassword> {
    const user = await this.userRepository.findOne(
      { email },
      { username: 1, email: 1, _id: 1, password: 1, roles: 1 },
    );
    return user;
  }

  async checkIfUserExists(email: string, username: string): Promise<boolean> {
    const userByEmail = await this.userRepository.findOne({ email });
    const userByUsername = await this.userRepository.findOne({ username });
    return userByEmail || userByUsername ? true : false;
  }
}
