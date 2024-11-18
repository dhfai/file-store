/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  UploadedFile,
  Body,
  UseInterceptors,
  Get,
  Param,
  Res,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { GoogleDriveService } from './google-drive.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class GoogleDriveController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueName = uuidv4();
          const ext = path.extname(file.originalname);
          const filename = `${uniqueName}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async uploadFile(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('fileName') fileName?: string,
    @Body('nomorSurat') nomorSurat?: string,
    @Body('jenisSurat') jenisSurat?: string,
    @Body('tanggalDibuat') tanggalDibuat?: string,
  ) {
    if (!file) {
      throw new Error('File not found');
    }

    const ext = path.extname(file.originalname);
    const finalFileName = fileName ? `${fileName}${ext}` : file.originalname;

    const filePath = path.join(__dirname, '../../uploads', file.filename);

    return this.googleDriveService.uploadFile(
      finalFileName,
      filePath,
      nomorSurat,
      jenisSurat,
      tanggalDibuat,
      req.user,
    );
  }

  @Get('/allFIles')
  async getAllFiles() {
    return await this.googleDriveService.listAllFIles();
  }

  @Get(':fileId')
  async downloadFile(@Param('fileId') fileId: string, @Res() res: Response) {
    try {
      const fileMetadata =
        await this.googleDriveService.getFileMetadata(fileId);
      const fileName = fileMetadata.name;

      const fileStream = await this.googleDriveService.downloadFile(fileId);

      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      });

      fileStream.pipe(res);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error downloading file', error: error.message });
    }
  }

  @Get(':fileId/preview')
  async previewFile(@Param('fileId') fileId: string, @Res() res: Response) {
    try {
      const fileMetadata =
        await this.googleDriveService.getFileMetadata(fileId);
      const fileName = fileMetadata.name;
      const mimeType = fileMetadata.mimeType;

      const fileStream = await this.googleDriveService.downloadFile(fileId);

      res.set({
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${fileName}"`,
      });

      fileStream.pipe(res);
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Error previewing file', error: error.message });
    }
  }

  @Post('share/:fileId')
  async shareFile(
    @Param('fileId') fileId: string,
    @Body('email') email?: string,
  ) {
    return await this.googleDriveService.shareFileWithUser(fileId, email);
  }

  @Delete('delete/:fileId')
  async deleteFile(@Param('fileId') fileId: string) {
    return await this.googleDriveService.deleteFile(fileId);
  }
}
