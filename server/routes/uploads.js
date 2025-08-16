const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { upload, enforceUserQuota, enforceUserQuotaPostUpload, malwareScanMiddleware } = require('../middleware/upload');

const router = express.Router();

// Auth required for uploads
router.use(authenticateToken);

// Single-file upload endpoint example
router.post(
  '/single',
  enforceUserQuota,
  upload.single('file'),
  enforceUserQuotaPostUpload,
  malwareScanMiddleware,
  (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    return res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        filename: file.filename,
        path: file.path,
      },
    });
  }
);

// Multi-file upload endpoint example
router.post(
  '/multiple',
  enforceUserQuota,
  upload.array('files', 10),
  enforceUserQuotaPostUpload,
  malwareScanMiddleware,
  (req, res) => {
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ message: 'No files uploaded' });
    return res.status(201).json({
      message: 'Files uploaded successfully',
      files: files.map((file) => ({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        filename: file.filename,
        path: file.path,
      })),
    });
  }
);

module.exports = router;


