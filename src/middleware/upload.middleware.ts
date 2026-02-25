import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { env } from '../config/env';

// Ensure upload directory exists
if (!fs.existsSync(env.upload.dir)) {
    fs.mkdirSync(env.upload.dir, { recursive: true });
}

const BLOCKED_EXTENSIONS = ['.js', '.ts', '.py', '.sh', '.php', '.exe', '.bat', '.cmd', '.ps1', '.rb'];
const ALLOWED_MIMES = new Set(env.upload.allowedMimeTypes);

const storage = multer.diskStorage({
    destination: env.upload.dir,
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uuidv4()}${ext}`);
    },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    const ext = path.extname(file.originalname).toLowerCase();

    if (BLOCKED_EXTENSIONS.includes(ext)) {
        return cb(new Error('File type not allowed'));
    }

    if (!ALLOWED_MIMES.has(file.mimetype)) {
        return cb(new Error(`Only jpeg, png, and pdf files are accepted. Got: ${file.mimetype}`));
    }

    cb(null, true);
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: env.upload.maxFileSize,
        files: 3,
    },
});
