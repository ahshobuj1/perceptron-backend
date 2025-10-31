import multer from 'multer';

// 1. Use memory storage to hold the file as a buffer in RAM
const storage = multer.memoryStorage();

// 2. Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Basic file type check
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  },
});
