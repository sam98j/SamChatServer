import e from 'express';
import { diskStorage } from 'multer';

export const multerConfig = diskStorage({
  destination: './client',
  filename: (req: e.Request, file: Express.Multer.File, cb: (err: Error | null, filename: string) => void) => {
    cb(null, file.originalname);
  },
});
