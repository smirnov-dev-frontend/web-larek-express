import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR, UPLOAD_TEMP_DIR } from '../config';

export const moveFileFromTemp = async (fileName: string) => {
  const name = path.basename(fileName);
  const tempPath = path.join(UPLOAD_TEMP_DIR, name);
  if (!fs.existsSync(tempPath)) {
    return;
  }
  await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.promises.copyFile(tempPath, path.join(UPLOAD_DIR, name));
  await fs.promises.rm(tempPath, { force: true });
};

export const removeFile = (fileName: string) => fs.promises.rm(
  path.join(UPLOAD_DIR, path.basename(fileName)),
  { force: true },
);
