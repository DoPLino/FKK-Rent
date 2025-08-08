const express = require('express');
const { param } = require('express-validator');
const router = express.Router();

const { authenticateToken, requireStaff } = require('../middleware/auth');

// Placeholder for QR controller (to be implemented)
const qrController = {
  generateQRCode: async (req, res) => {
    res.json({ message: 'Generate QR code - to be implemented' });
  },
  scanQRCode: async (req, res) => {
    res.json({ message: 'Scan QR code - to be implemented' });
  },
  bulkGenerateQR: async (req, res) => {
    res.json({ message: 'Bulk generate QR codes - to be implemented' });
  }
};

// Routes
router.use(authenticateToken);

// Generate QR code for equipment
router.get('/equipment/:id', 
  requireStaff,
  param('id').isMongoId().withMessage('Valid equipment ID is required'), 
  qrController.generateQRCode
);

// Scan QR code (decode and return equipment info)
router.post('/scan', 
  requireStaff,
  qrController.scanQRCode
);

// Bulk generate QR codes for multiple equipment
router.post('/bulk-generate', 
  requireStaff,
  qrController.bulkGenerateQR
);

module.exports = router;
