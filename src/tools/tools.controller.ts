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
import { ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PDFDocument } from 'pdf-lib';

@Controller('tools')
@ApiTags('Tools')
export class ToolsController {
    @Post('merge')
    @HttpCode(200)
    @Header(
        'Content-Disposition',
        'attachment; filename="merged_documents.pdf"',
    )
    @UseInterceptors(AnyFilesInterceptor())
    // Swagger meta-data
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
        // Extract file buffers
        const pdfsToMerge = files.map((file) => file.buffer);
        // Init empty document
        const mergedPdf = await PDFDocument.create();
        // Add pages from each file
        for (const pdfBytes of pdfsToMerge) {
            const pdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(
                pdf,
                pdf.getPageIndices(),
            );
            copiedPages.forEach((page) => {
                mergedPdf.addPage(page);
            });
        }
        // Save merged file
        const buffer = await mergedPdf.save();
        // Return streamable file
        return new StreamableFile(buffer, { type: 'application/pdf' });
    }
}
