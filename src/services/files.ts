import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class FileService {
  async writeFile(fileData: { bufferStr: string; senderId: string; reciverId: string }) {
    const { bufferStr, senderId, reciverId } = fileData;
    // new date
    const date = new Date();
    // file time stamp
    const fileTimeStamp = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDay()}-${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    // voice file name
    const fileName = `${senderId}-${reciverId}-${fileTimeStamp}.webm`;
    const base64Data = bufferStr.split(',')[1];
    try {
      // create buffer from string
      const buffer = Buffer.from(base64Data, 'base64');
      // write file to the disk from buffer
      await fs.promises.writeFile(join(__dirname, '..', '..', 'client', fileName), buffer);
      return Promise.resolve(fileName);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
