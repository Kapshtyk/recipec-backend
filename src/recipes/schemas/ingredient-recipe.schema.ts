import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, SchemaTypes, Types } from 'mongoose'

export type IngredientRecipeDocument = HydratedDocument<IngredientRecipe>

@Schema()
export class IngredientRecipe {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Ingredient' })
  ingredient: Types.ObjectId

  @Prop()
  quantity: number

  @Prop({ type: Types.ObjectId, ref: 'Recipe' })
  recipe: Types.ObjectId
}

export const IngredientRecipeSchema =
  SchemaFactory.createForClass(IngredientRecipe)
