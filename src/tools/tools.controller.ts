import {
    Controller,
    Post,
    StreamableFile,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { PDFDocument } from 'pdf-lib';

@Controller('tools')
@ApiTags('Tools')
export class ToolsController {
    @Post('merge')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
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
    @UseInterceptors(AnyFilesInterceptor())
    async uploadFile(
        @UploadedFiles() files: Array<Express.Multer.File>,
    ): Promise<StreamableFile> {
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
