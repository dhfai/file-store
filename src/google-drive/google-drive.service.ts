/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';
import { parseISO } from 'date-fns';

@Injectable()
export class GoogleDriveService {
  private driveClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const keyFile = this.configService.get<string>(
      'GOOGLE_APPLICATION_CREDENTIALS',
    );

    const auth = new google.auth.GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.driveClient = google.drive({
      version: 'v3',
      auth,
    });
  }

  async uploadFile(
    fileName: string,
    filePath: string,
    nomorSurat: string,
    jenisSurat: string,
    tanggalDibuat: string,
  ) {
    console.log(`Uploading file: ${fileName} from path: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new InternalServerErrorException(`File not found: ${filePath}`);
    }

    try {
      const response = await this.driveClient.files.create({
        requestBody: {
          name: fileName,
          mimeType: 'application/octet-stream',
        },
        media: {
          mimeType: 'application/octet-stream',
          body: fs.createReadStream(filePath),
        },
      });

      const fileId = response.data.id;
      console.log(`File uploaded to Google Drive with ID: ${fileId}`);

      // Make the file public
      await this.setFilePublic(fileId);

      const tanggalDibuatDate = parseISO(tanggalDibuat);

      // Store file metadata in the database
      await this.prisma.file.create({
        data: {
          fileId: fileId,
          fileName: fileName,
          nomorSurat: nomorSurat,
          jenisSurat: jenisSurat,
          tanggalDibuat: tanggalDibuatDate,
        },
      });

      // Delete local file after upload
      await this.deleteLocalFile(filePath);

      return {
        success: true,
        fileId: fileId,
        message: `File '${fileName}' successfully uploaded`,
      };
    } catch (error) {
      console.error('Error uploading file:', error.message);
      throw new InternalServerErrorException(
        'Error uploading file to Google Drive',
      );
    }
  }

  async listAllFIles() {
    try {
      const files = await this.prisma.file.findMany();
      return files;
    } catch (error) {
      console.error('Error retrieving file list:', error.message);
      throw new InternalServerErrorException('Error retrieving file list');
    }
  }

  async setFilePublic(fileId: string): Promise<void> {
    try {
      await this.driveClient.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
      console.log(`File ${fileId} is now public.`);
    } catch (error) {
      console.error('Error setting file to public:', error.message);
      throw new InternalServerErrorException('Error setting file to public');
    }
  }

  private async deleteLocalFile(filePath: string): Promise<void> {
    try {
      fs.unlinkSync(filePath);
      console.log(`Successfully deleted file: ${filePath}`);
    } catch (error) {
      console.error(`Error deleting file: ${filePath}`, error.message);
      throw new InternalServerErrorException('Error deleting local file');
    }
  }

  async getFileMetadata(fileId: string): Promise<any> {
    try {
      const response = await this.driveClient.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType',
      });

      return response.data;
    } catch (error) {
      console.error('Error getting file metadata:', error.message);
      throw new InternalServerErrorException(
        'Error getting file metadata from Google Drive',
      );
    }
  }

  async downloadFile(fileId: string): Promise<any> {
    try {
      const response = await this.driveClient.files.get(
        {
          fileId: fileId,
          alt: 'media',
        },
        { responseType: 'stream' },
      );

      return response.data;
    } catch (error) {
      console.error('Error downloading file:', error.message);
      throw new InternalServerErrorException(
        'Error downloading file from Google Drive',
      );
    }
  }

  async shareFileWithUser(fileId: string, email?: string) {
    try {
      const emailAddress =
        email || this.configService.get<string>('SHARE_WITH_EMAIL');

      if (!emailAddress) {
        throw new InternalServerErrorException('No email address provided');
      }

      await this.driveClient.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'user',
          emailAddress: emailAddress,
        },
      });
      console.log(`File ${fileId} shared with ${emailAddress}`);
    } catch (error) {
      console.error('Error sharing file:', error.message);
      throw new InternalServerErrorException('Error sharing file');
    }
  }

  async deleteFile(fileId: string) {
    try {
      // First, delete the file from Google Drive
      await this.driveClient.files.delete({
        fileId: fileId,
      });
      console.log(`File ${fileId} deleted from Google Drive.`);

      // Then, delete the file record from the database
      await this.prisma.file.delete({
        where: {
          fileId: fileId,
        },
      });
      console.log(`File ${fileId} deleted from the database.`);

      return {
        success: true,
        message: `File '${fileId}' successfully deleted from Google Drive and database.`,
      };
    } catch (error) {
      console.error('Error deleting file:', error.message);
      throw new InternalServerErrorException(
        'Error deleting file from Google Drive or database',
      );
    }
  }
}
