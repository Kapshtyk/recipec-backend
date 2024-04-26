import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { HydratedDocument, SchemaTypes, Types } from 'mongoose'

export type RecipeDocument = HydratedDocument<Recipe>

@Schema()
export class Recipe {
  @ApiProperty({ example: 'Pasta', description: 'Title' })
  @Prop({
    required: true,
    minlength: 3,
    maxlength: 20
  })
  title: string

  @ApiProperty({ example: 'Italy', description: 'Origin' })
  @Prop({
    required: true
  })
  origin: string

  @ApiProperty({
    example: 'Pasta with tomato sauce',
    description: 'Description'
  })
  @Prop({
    required: true
  })
  description: string

  @ApiProperty({
    example: 'Cook pasta, add sauce',
    description: 'Instructions'
  })
  @Prop({
    required: true
  })
  instructions: string

  @Prop({
    required: false
  })
  @ApiProperty({ example: 'https://www.image.com', description: 'Image' })
  image: string

  @Prop([{ type: SchemaTypes.ObjectId, ref: 'IngredientRecipe' }])
  ingredients: Types.ObjectId[]

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  author: Types.ObjectId
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe)
