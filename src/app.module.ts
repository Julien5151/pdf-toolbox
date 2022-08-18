import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ToolsController } from './tools/tools.controller';

@Module({
    imports: [ConfigModule.forRoot()],
    controllers: [ToolsController],
})
export class AppModule {}
