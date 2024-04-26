import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { AddIngredientsToRecipeDto } from './dto/add-ingredients-to-recipe.dto'
import {
  IngredientRecipe,
  IngredientRecipeDocument
} from './schemas/ingredient-recipe.schema'
import { Recipe, RecipeDocument } from './schemas/recipe.schema'

@Injectable()
export class IngredientRecipesService {
  constructor(
    @InjectModel(IngredientRecipe.name)
    private ingredientRecipeRepository: Model<IngredientRecipe>
  ) {}

  async createIngredientRecipe(
    ingredient: AddIngredientsToRecipeDto,
    recipe: Recipe
  ): Promise<IngredientRecipeDocument> {
    const ingredientRecipe = await this.ingredientRecipeRepository.create({
      ingredient: ingredient.ingredient,
      quantity: ingredient.quantity,
      recipe
    })
    return ingredientRecipe
  }

  async updateIngredientRecipe(
    ingredientRecipe: IngredientRecipeDocument,
    quantity: number
  ): Promise<IngredientRecipeDocument> {
    ingredientRecipe.set('quantity', quantity)
    await ingredientRecipe.save()
    return ingredientRecipe
  }

  async removeIngredientRecipe(ingredientRecipe: IngredientRecipeDocument) {
    await this.ingredientRecipeRepository.findByIdAndRemove(
      ingredientRecipe._id
    )
    return { message: 'IngredientRecipe was deleted' }
  }

  async removeIngredientRecipeByRecipe(
    recipe: RecipeDocument
  ): Promise<object> {
    const ingredientRecipes = await this.getIngredientsRecipeByRecipe(recipe)
    await Promise.all(
      ingredientRecipes.map(async (ingredientRecipe) => {
        await this.removeIngredientRecipe(ingredientRecipe)
      })
    )
    return { message: 'IngredientRecipes were deleted' }
  }

  async getIngredientsRecipeByRecipe(
    recipe: RecipeDocument
  ): Promise<IngredientRecipeDocument[]> {
    const ingredientsRecipe = await this.ingredientRecipeRepository
      .find({
        recipe: recipe._id
      })
      .exec()
    return ingredientsRecipe
  }
}
