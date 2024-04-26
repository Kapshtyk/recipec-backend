import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

import { AuthModule } from './auth/auth.module'
import { IngredientsModule } from './ingredients/ingredients.module'
import { RecipesModule } from './recipes/recipes.module'
import { RolesModule } from './roles/roles.module'
import { UsersModule } from './users/users.module'

@Module({
  controllers: [],
  providers: [],
  imports: [
      ServeStaticModule.forRoot({
        rootPath: join(__dirname, '..', 'swagger-static'),
        serveRoot: process.env.NODE_ENV === 'development' ? '/' : '/swagger',
      }),
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    UsersModule,
    RolesModule,
    AuthModule,
    RecipesModule,
    IngredientsModule
  ]
})
export class AppModule {}
