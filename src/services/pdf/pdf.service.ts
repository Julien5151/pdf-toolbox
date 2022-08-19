import { BadRequestException, Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class PdfService {
    private readonly PDT_MIME_TYPE = 'application/pdf';
    private readonly supportedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        this.PDT_MIME_TYPE,
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
        // Add content from each file
        for (const file of files) {
            if (file.mimetype === this.PDT_MIME_TYPE) {
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
                const jpgImage = await mergedPdf.embedJpg(file.buffer);
                const jpgDims = jpgImage.scale(1);
                const page = mergedPdf.addPage();
                page.drawImage(jpgImage, {
                    x: page.getWidth() / 2 - jpgDims.width / 2,
                    y: page.getHeight() / 2 - jpgDims.height / 2,
                    width: jpgDims.width,
                    height: jpgDims.height,
                });
            }
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
