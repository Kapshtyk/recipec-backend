import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/users/schemas/users.schema'
import { UsersService } from 'src/users/users.service'

import { IngredientsModule } from '../ingredients/ingredients.module'
import {
  Ingredient,
  IngredientSchema
} from '../ingredients/schemas/ingredient.schema'
import { IngredientRecipesService } from './ingredients-recipe.service'
import { RecipesController } from './recipes.controller'
import { RecipesService } from './recipes.service'
import {
  IngredientRecipe,
  IngredientRecipeSchema
} from './schemas/ingredient-recipe.schema'
import { Recipe, RecipeSchema } from './schemas/recipe.schema'

@Module({
  controllers: [RecipesController],
  providers: [RecipesService, IngredientRecipesService, UsersService],
  imports: [
    IngredientsModule,
    MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }]),
    MongooseModule.forFeature([
      { name: Ingredient.name, schema: IngredientSchema }
    ]),
    MongooseModule.forFeature([
      { name: IngredientRecipe.name, schema: IngredientRecipeSchema }
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          secret: process.env.JWT_SECRET
        }
      },
      inject: [ConfigService]
    })
  ]
})
export class RecipesModule {}
