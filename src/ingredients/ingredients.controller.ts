import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post
} from '@nestjs/common'

import { CreateIngredientDto } from './dto/create-ingredient.dto'
import { UpdateIngredientDto } from './dto/update-ingredient.dto'
import { IngredientsService } from './ingredients.service'

@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientsService.createIngredient(createIngredientDto)
  }

  @Get()
  findAll() {
    return this.ingredientsService.getAllIngredients()
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.ingredientsService.getOneIngredient(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateIngredientDto: UpdateIngredientDto
  ) {
    return this.ingredientsService.updateIngredient(id, updateIngredientDto)
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.ingredientsService.removeIngredient(id)
  }
}
