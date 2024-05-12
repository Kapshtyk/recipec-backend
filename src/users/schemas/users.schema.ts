import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";

import { HydratedDocument, ObjectId } from "mongoose";

export type UserDocument = HydratedDocument<User>;

export class UserDbShortDto {
  @ApiProperty({ example: "123456", description: "Id" })
  _id: ObjectId;
  @ApiProperty({ example: "user", description: "Username" })
  username: string;
  @ApiProperty({ example: "email@gmail.com", description: "Email" })
  email: string;
}

@Schema()
export class User {
  @Prop({
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20,
  })
  username: string;

  @Prop({
    required: true,
    unique: true,
    validate: {
      validator: (value) => /\S+@\S+\.\S+/.test(value),
      message: "Invalid email format",
    },
  })
  email: string;

  @Prop({
    required: true,
    select: false,
  })
  password: string;
}

export type UserDbShort = Pick<UserDocument, "_id" | "username" | "email">;
export type UserDbWithPassword = UserDbShort & { password: string };

export const UserSchema = SchemaFactory.createForClass(User);
