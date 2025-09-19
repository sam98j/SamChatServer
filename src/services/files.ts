import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { FileToWritenData } from './files.interface';

@Injectable()
export class FileService {
  async writeFile(fileData: FileToWritenData) {
    const { bufferStr, senderId, receiverId, fileName } = fileData;
    // new date
    const date = new Date();
    // file time stamp
    const fileTimeStamp = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDay()}-${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    // file row data
    const base64Data = bufferStr.split(',')[1];
    // file ext
    const fileExt = fileName.split('.').pop();

    // voice file name
    const newfileName = `${senderId}-${receiverId}-${fileTimeStamp}.${fileExt}`;
    try {
      // create buffer from string
      const buffer = Buffer.from(base64Data, 'base64');
      // write file to the disk from buffer
      await fs.promises.writeFile(join(__dirname, '..', '..', 'client', newfileName), buffer);
      return Promise.resolve(newfileName);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
