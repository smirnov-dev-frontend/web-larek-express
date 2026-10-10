import multer from 'multer';
import { faker } from '@faker-js/faker';
import { UPLOAD_TEMP_DIR } from '../config';
import BadRequestError from '../errors/bad-request-error';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const extensions: Record<string, string> = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

const storage = multer.diskStorage({
  destination: UPLOAD_TEMP_DIR,
  filename: (_req, file, cb) => {
    cb(null, `${faker.string.uuid()}.${extensions[file.mimetype]}`);
  },
});

const fileMiddleware = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype in extensions) {
      return cb(null, true);
    }
    return cb(new BadRequestError('Недопустимый тип файла'));
  },
});

export default fileMiddleware;
