import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema()
export class User {
  @ApiProperty({ example: 'user', description: 'Username' })
  @Prop({
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20
  })
  username: string

  @ApiProperty({ example: 'email@gmail.com', description: 'Email' })
  @Prop({
    required: true,
    unique: true,
    validate: {
      validator: (value) => /\S+@\S+\.\S+/.test(value),
      message: 'Invalid email format'
    }
  })
  email: string

  @ApiProperty({ example: '123456', description: 'Password' })
  @Prop({
    required: true
  })
  password: string
}

export const UserSchema = SchemaFactory.createForClass(User)
