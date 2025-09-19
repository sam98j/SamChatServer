import e from 'express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

export const multerConfig = diskStorage({
  destination: './client',
  filename: (req: e.Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) => {
    cb(null, `/${uuidv4()}.${file.mimetype.split('/')[1]}`);
  },
});
