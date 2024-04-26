import { Ingredient } from 'src/ingredients/schemas/ingredient.schema'

export class AddIngredientsToRecipeDto {
  ingredient: Ingredient
  quantity: number
}
