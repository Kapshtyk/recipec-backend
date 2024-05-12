import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  SetMetadata,
  UseGuards,
} from "@nestjs/common";

import { AuthGuard, IRequestWithUser } from "../auth/auth.guard";
import { RolesGuard } from "../roles/roles.guard";

import { CreateRecipeDto } from "./dto/create-recipe.dto";
import { UpdateRecipeDto } from "./dto/update-recipe.dto";
import { RecipesService } from "./recipes.service";

@Controller("recipes")
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Req() req: IRequestWithUser,
    @Body() createRecipeDto: CreateRecipeDto,
  ) {
    return this.recipesService.createRecipe(createRecipeDto, req.user);
  }

  @Get()
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  @SetMetadata("roles", ["admin"])
  findAll() {
    return this.recipesService.findAll();
  }

  @Get(":id")
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  @SetMetadata("roles", ["admin"])
  findOne(@Param("id") id: string) {
    return this.recipesService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  update(
    @Req() req: IRequestWithUser,
    @Param("id") id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ) {
    return this.recipesService.updateRecipe(id, updateRecipeDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  remove(@Req() req: IRequestWithUser, @Param("id") id: string) {
    return this.recipesService.removeRecipe(id, req.user);
  }
}
