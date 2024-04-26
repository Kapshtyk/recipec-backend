import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common'
import { Request } from 'express'
import { AuthGuard } from 'src/auth/auth.guard'
import { UserDocument } from 'src/users/schemas/users.schema'

import { CreateRecipeDto } from './dto/create-recipe.dto'
import { UpdateRecipeDto } from './dto/update-recipe.dto'
import { RecipesService } from './recipes.service'

interface IRequestWithUser extends Request {
  user?: UserDocument
}

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Req() req: IRequestWithUser,
    @Body() createRecipeDto: CreateRecipeDto
  ) {
    return this.recipesService.createRecipe(createRecipeDto, req.user)
  }

  @Get()
  findAll() {
    return this.recipesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id)
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Req() req: IRequestWithUser,
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto
  ) {
    return this.recipesService.updateRecipe(id, updateRecipeDto, req.user)
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Req() req: IRequestWithUser, @Param('id') id: string) {
    return this.recipesService.removeRecipe(id, req.user)
  }
}
