const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const {
  MAX_FILE_SIZE,
  UPLOAD_PATH,
  MAX_FILES_PER_USER,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
} = require('../config/env');

// Disk storage with safe filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user?._id?.toString() || 'anonymous';
    const userDir = path.join(UPLOAD_PATH, userId);
    try {
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true, mode: 0o700 });
      }
    } catch (e) {
      return cb(e);
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = crypto.randomBytes(16).toString('hex');
    cb(null, `${base}${ext}`);
  },
});

// MIME and extension whitelist check
function fileFilter(req, file, cb) {
  const mimetype = file.mimetype;
  const ext = path.extname(file.originalname).toLowerCase();

  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(mimetype);
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);

  if (!isMimeAllowed || !isExtAllowed) {
    return cb(new Error('Unsupported file type'));
  }

  cb(null, true);
}

// Multer instance with size limit
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

// Simple per-user pre-upload file count quota enforcement
function enforceUserQuota(req, res, next) {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) return next(); // apply only to authenticated users

    const userDir = path.join(UPLOAD_PATH, userId);
    if (!fs.existsSync(userDir)) return next();
    const files = fs.readdirSync(userDir).filter((f) => fs.statSync(path.join(userDir, f)).isFile());
    if (files.length >= MAX_FILES_PER_USER) {
      return res.status(429).json({ message: 'Upload quota exceeded' });
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

// Post-upload quota enforcement including the just-uploaded files
function enforceUserQuotaPostUpload(req, res, next) {
  try {
    const userId = req.user?._id?.toString();
    if (!userId) return next();
    const userDir = path.join(UPLOAD_PATH, userId);
    const files = fs.existsSync(userDir)
      ? fs.readdirSync(userDir).filter((f) => fs.statSync(path.join(userDir, f)).isFile())
      : [];

    const newCount = Array.isArray(req.files) ? req.files.length : req.file ? 1 : 0;
    if (files.length + newCount > MAX_FILES_PER_USER) {
      // Remove the files that were just uploaded in this request
      const toRemove = Array.isArray(req.files) ? req.files : req.file ? [req.file] : [];
      toRemove.forEach((f) => {
        try { fs.unlinkSync(f.path); } catch (_) {}
      });
      return res.status(429).json({ message: 'Upload quota exceeded' });
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

// Malware scanning stub (replace with real scanner e.g. clamd)
async function scanFileForMalware(filePath) {
  // TODO: Integrate a real malware scanner such as clamdscan or an external API.
  // For now, a placeholder that always passes.
  return { clean: true };
}

async function malwareScanMiddleware(req, res, next) {
  try {
    const files = [];
    if (req.file) files.push(req.file);
    if (req.files && Array.isArray(req.files)) files.push(...req.files);
    if (req.files && !Array.isArray(req.files)) {
      // fields style { fieldName: [files...] }
      Object.values(req.files).forEach((arr) => {
        if (Array.isArray(arr)) files.push(...arr);
      });
    }

    for (const f of files) {
      const result = await scanFileForMalware(f.path);
      if (!result.clean) {
        try { fs.unlinkSync(f.path); } catch (_) {}
        return res.status(400).json({ message: 'Malware detected in uploaded file' });
      }
    }
    next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  upload,
  enforceUserQuota,
  enforceUserQuotaPostUpload,
  malwareScanMiddleware,
};


