import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { CreateUserDto } from './dto/create-user.dto'
import { User, UserDocument } from './schemas/users.schema'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userRepository: Model<User>) {}

  async createUser(dto: CreateUserDto): Promise<UserDocument> {
    console.log(dto)
    const user = await this.userRepository.create(dto)
    return user
  }

  async getOneUser(id: number): Promise<UserDocument> {
    const user = await this.userRepository.findById(id)
    return user
  }

  async getAllUsers(): Promise<UserDocument[]> {
    const users = await this.userRepository.find()
    return users
  }

  async removeUser(id: number): Promise<{ message: string }> {
    await this.userRepository.findByIdAndRemove(id)
    return { message: 'User was deleted' }
  }

  async getUserByEmail(email: string): Promise<UserDocument> {
    const user = await this.userRepository.findOne({ email })
    return user
  }

  async checkIfUserExists(email: string, username: string): Promise<boolean> {
    const userByEmail = await this.userRepository.findOne({ email })
    const userByUsername = await this.userRepository.findOne({ username })
    return userByEmail || userByUsername ? true : false
  }

  async clear() {
    await this.userRepository.deleteMany({})
  }
}
