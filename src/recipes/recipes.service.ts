import {
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { IngredientsService } from 'src/ingredients/ingredients.service'
import {
  Ingredient,
  IngredientDocument
} from 'src/ingredients/schemas/ingredient.schema'
import { UserDocument } from 'src/users/schemas/users.schema'

import { CreateRecipeIngredientDto } from './dto/create-recipe-ingredient.dto'
import { CreateRecipeDto } from './dto/create-recipe.dto'
import { UpdateRecipeDto } from './dto/update-recipe.dto'
import { IngredientRecipesService } from './ingredients-recipe.service'
import { IngredientRecipeDocument } from './schemas/ingredient-recipe.schema'
import { Recipe, RecipeDocument } from './schemas/recipe.schema'

interface IRecipeIngredients {
  ingredient: IngredientDocument
  quantity: number
}

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name)
    @InjectModel(Ingredient.name)
    private recipeRepository: Model<Recipe>,
    private ingredientsService: IngredientsService,
    private ingredientRecipeService: IngredientRecipesService
  ) {}

  async createRecipe(
    createRecipeDto: CreateRecipeDto,
    user: UserDocument
  ): Promise<RecipeDocument> {
    const recipe = await this.recipeRepository.create({
      title: createRecipeDto.title,
      description: createRecipeDto.description,
      origin: createRecipeDto.origin,
      instructions: createRecipeDto.instructions,
      image: createRecipeDto.image,
      author: user._id
    })
    const updatedIngredients = await this.addIngredientsToDatabase(
      createRecipeDto.ingredients
    )
    const ingredientsRecipe = await this.addIngredientsToRecipe(
      recipe,
      updatedIngredients
    )
    recipe.set(
      'ingredients',
      ingredientsRecipe.map((ingredient) => ingredient._id)
    )
    await recipe.save()
    return recipe
  }

  findAll(): Promise<RecipeDocument[]> {
    const recipes = this.recipeRepository
      .find()
      .populate({
        path: 'ingredients',
        populate: [
          { path: 'ingredient', model: 'Ingredient', select: 'name units' }
        ]
      })
      .populate('author', 'username email')
      .exec()
    return recipes
  }

  findOne(id: string): Promise<RecipeDocument> {
    const recipe = this.recipeRepository
      .findById(id)
      .populate({
        path: 'ingredients',
        populate: [
          { path: 'ingredient', model: 'Ingredient', select: 'name units' }
        ]
      })
      .populate('author', 'username email')
      .exec()

    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`)
    }

    return recipe
  }

  async updateRecipe(
    id: string,
    updateRecipeDto: UpdateRecipeDto,
    user: UserDocument
  ) {
    const recipe = await this.recipeRepository.findById(id)
    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`)
    }

    if (recipe.author.toString() !== user._id.toString()) {
      throw new UnauthorizedException(
        `User with id ${user._id} is not the author of recipe with id ${id}`
      )
    }

    let updatedRepice

    if (updateRecipeDto.ingredients) {
      await this.ingredientRecipeService.removeIngredientRecipeByRecipe(recipe)

      const updatedIngredients = await this.addIngredientsToDatabase(
        updateRecipeDto.ingredients
      )

      const updatedIngredientsRecipes = await this.addIngredientsToRecipe(
        recipe,
        updatedIngredients
      )

      updatedRepice = await this.recipeRepository.findByIdAndUpdate(id, {
        ...updateRecipeDto,
        ingredients: updatedIngredientsRecipes.map(
          (ingredient) => ingredient._id
        )
      })
    } else {
      updatedRepice = await this.recipeRepository.findByIdAndUpdate(
        id,
        updateRecipeDto
      )
    }
    return updatedRepice
  }

  async removeRecipe(id: string, user: UserDocument) {
    const recipe = await this.recipeRepository.findById(id)
    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`)
    }

    if (recipe.author.toString() !== user._id.toString()) {
      throw new UnauthorizedException(
        `User with id ${user._id} is not the author of recipe with id ${id}`
      )
    }
    await this.recipeRepository.findByIdAndDelete(id)
    await this.ingredientRecipeService.removeIngredientRecipeByRecipe(recipe)

    return { message: `Recipe with id ${id} deleted` }
  }

  private async addIngredientsToDatabase(
    ingredients: CreateRecipeIngredientDto[]
  ): Promise<IRecipeIngredients[]> {
    const updatedIngredients = []
    for (const ingredient of ingredients) {
      const existingIngredient =
        await this.ingredientsService.findIngredientByNameAndUnits(
          ingredient.name,
          ingredient.units
        )

      if (existingIngredient) {
        updatedIngredients.push({
          ingredient: existingIngredient,
          quantity: ingredient.quantity
        })
      } else {
        const newIngredient = await this.ingredientsService.createIngredient({
          name: ingredient.name,
          units: ingredient.units
        })
        updatedIngredients.push({
          ingredient: newIngredient,
          quantity: ingredient.quantity
        })
      }
    }
    return updatedIngredients
  }

  private async addIngredientsToRecipe(
    recipe: RecipeDocument,
    ingredients: IRecipeIngredients[]
  ): Promise<IngredientRecipeDocument[]> {
    const addedIngredient = []
    const ingredientRecipes = []
    for (const ingredient of ingredients) {
      if (addedIngredient.includes(ingredient.ingredient.id)) {
        continue
      }
      const ingredientRecipe =
        await this.ingredientRecipeService.createIngredientRecipe(
          ingredient,
          recipe
        )
      ingredientRecipes.push(ingredientRecipe)
      addedIngredient.push(ingredient.ingredient.id)
    }
    return ingredientRecipes
  }
}
