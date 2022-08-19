import { BadRequestException, Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class PdfService {
    private readonly PDF_MIME_TYPE = 'application/pdf';
    private readonly PNG_MIME_TYPE = 'image/png';
    private readonly supportedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        this.PNG_MIME_TYPE,
        this.PDF_MIME_TYPE,
    ];

    /**
     * Merge all provided files into a single pdf document
     * @param files Array of files to be merged
     * @returns Raw binary buffer of the newly created pdf document
     */
    public async mergeFiles(
        files: Array<Express.Multer.File>,
    ): Promise<Buffer> {
        // Check files formats
        this.checkFormats(files);
        // Init empty document
        const mergedPdf = await PDFDocument.create();
        try {
            // Add content from each file
            for (const file of files) {
                if (file.mimetype === this.PDF_MIME_TYPE) {
                    // Pdf merging
                    const pdf = await PDFDocument.load(file.buffer);
                    const copiedPages = await mergedPdf.copyPages(
                        pdf,
                        pdf.getPageIndices(),
                    );
                    copiedPages.forEach((page) => {
                        mergedPdf.addPage(page);
                    });
                } else {
                    // Image merging
                    const image = await (file.mimetype === this.PNG_MIME_TYPE
                        ? mergedPdf.embedPng(file.buffer)
                        : mergedPdf.embedJpg(file.buffer));
                    const dims = image.scale(1);
                    const page = mergedPdf.addPage();
                    page.drawImage(image, {
                        x: page.getWidth() / 2 - dims.width / 2,
                        y: page.getHeight() / 2 - dims.height / 2,
                        width: dims.width,
                        height: dims.height,
                    });
                }
            }
        } catch (error) {
            throw new BadRequestException(
                `Merging of files failed, one or more files could not be parsed`,
            );
        }

        // Save merged file
        return Buffer.from(await mergedPdf.save());
    }

    /**
     * Check that every file format is supported
     * @param files Array of files to be checked
     */
    private checkFormats(files: Array<Express.Multer.File>): void {
        files.forEach((file) => {
            if (!this.supportedMimeTypes.includes(file.mimetype)) {
                throw new BadRequestException('Unsupported file type');
            }
        });
    }
}
