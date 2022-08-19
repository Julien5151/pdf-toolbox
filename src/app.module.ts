import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ToolsController } from './tools/tools.controller';
import { PdfService } from './services/pdf/pdf.service';

@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [ToolsController],
    providers: [PdfService],
})
export class AppModule {}
