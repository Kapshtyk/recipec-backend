import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './App.module'

async function bootstrap() {
  const PORT = process.env.PORT || 5001
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('Recipes')
    .setDescription('The recipes API description')
    .setVersion('1.0')
    .addTag('recipes')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/api/docs', app, document)
  app.enableCors({
    // TODO: change url
    origin: '*'
  })
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
}

bootstrap()
