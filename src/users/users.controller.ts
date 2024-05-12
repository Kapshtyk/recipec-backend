import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AuthGuard, IRequestWithUser } from "../auth/auth.guard";

import { UserDbShortDto } from "./schemas/users.schema";
import { UsersService } from "./users.service";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: "Get current user" })
  @ApiResponse({ status: 200, type: UserDbShortDto })
  @UseGuards(AuthGuard)
  @Get("me")
  getMe(@Req() req: IRequestWithUser) {
    return this.usersService.getMe(req);
  }

  @ApiOperation({ summary: "Get user by id" })
  @ApiResponse({ status: 200, type: UserDbShortDto })
  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.usersService.getOneUser(id);
  }

  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, type: [UserDbShortDto] })
  @Get()
  getAll() {
    return this.usersService.getAllUsers();
  }

  @HttpCode(204)
  @ApiOperation({ summary: "Delete user by id" })
  @ApiResponse({ status: 204 })
  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.removeUser(id);
  }
}
