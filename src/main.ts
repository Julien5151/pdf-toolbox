import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    // Create nest application
    const app = await NestFactory.create(AppModule);
    // Swagger configuration
    const config = new DocumentBuilder()
        .setTitle('PdfToolbox API')
        .setDescription('Toolbox for manipulating PDF files')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
    // Get ConfigService from DI for configuring application port
    const configService = app.get<ConfigService>(ConfigService);
    // Start application
    await app.listen(configService.get('APP_PORT'));
}
bootstrap();
