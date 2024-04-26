import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { resolve } from 'path';
import { writeFileSync, createWriteStream } from 'fs';
import { get } from 'http';

import { AppModule } from './app.module'

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
  SwaggerModule.setup('/api/docs', app, document, {
    swaggerOptions: {}
  })
  app.enableCors({
    // TODO: change url
    origin: '*'
  })
  app.useGlobalPipes(new ValidationPipe())

  if (process.env.NODE_ENV === 'development') {
    const pathToSwaggerStaticFolder = resolve(process.cwd(), 'swagger-static');
    const pathToSwaggerJson = resolve(pathToSwaggerStaticFolder, 'swagger.json');
    const swaggerJson = JSON.stringify(document, null, 2);
    writeFileSync(pathToSwaggerJson, swaggerJson);
    console.log(`Swagger JSON file written to: '/swagger-static/swagger.json'`);
 }

  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
}



bootstrap()
