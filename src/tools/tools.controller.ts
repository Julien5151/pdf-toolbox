import {
    BadRequestException,
    Controller,
    Header,
    HttpCode,
    Post,
    StreamableFile,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
    ApiBody,
    ApiConsumes,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { PdfService } from 'src/services/pdf/pdf.service';

@Controller('tools')
@ApiTags('Tools')
export class ToolsController {
    constructor(private pdfService: PdfService) {}
    @Post('merge')
    @HttpCode(200)
    @Header(
        'Content-Disposition',
        'attachment; filename="merged_documents.pdf"',
    )
    @UseInterceptors(AnyFilesInterceptor())
    // Swagger meta-data
    @ApiOperation({
        summary: 'Merge pdfs and images into a single pdf document',
        description: `
        Supported file formats :
            • image/jpeg
            • image/jpg
            • image/png
            • application/pdf
        `,
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            required: ['files'],
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    })
    @ApiOkResponse({
        description: 'Documents merged successfully',
    })
    async uploadFile(
        @UploadedFiles() files: Array<Express.Multer.File>,
    ): Promise<StreamableFile> {
        if (!files || files.length === 0)
            throw new BadRequestException('At least one file is mandatory');
        // Merge files
        const buffer = await this.pdfService.mergeFiles(files);
        // Return streamable file
        return new StreamableFile(buffer, { type: 'application/pdf' });
    }
}
