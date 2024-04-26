import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { HydratedDocument } from 'mongoose'

export type IngredientDocument = HydratedDocument<Ingredient>

@Schema()
export class Ingredient {
  @ApiProperty({ example: 'Flour', description: 'Name' })
  @Prop({
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20
  })
  name: string

  @ApiProperty({ example: 'g', description: 'Units' })
  @Prop({
    required: true,
    minlength: 1,
    maxlength: 20
  })
  units: string
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient)
