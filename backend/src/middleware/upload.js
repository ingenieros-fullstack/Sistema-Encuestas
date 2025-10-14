import multer from 'multer';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ok = ['.csv', '.xlsx', '.xls'].some(ext =>
      file.originalname.toLowerCase().endsWith(ext)
    );
    ok ? cb(null, true) : cb(new Error('Solo se permiten archivos CSV o Excel'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});
