const path = require('path');
const fs = require('fs');
// Load and validate environment configuration once
const { env } = require('./loadEnv');

// Parse MAX_FILE_SIZE explicitly as integer
const MAX_FILE_SIZE = Number.isFinite(env.MAX_FILE_SIZE) ? env.MAX_FILE_SIZE : Number.parseInt(process.env.MAX_FILE_SIZE || '', 10);
const resolvedMaxFileSize = Number.isFinite(MAX_FILE_SIZE) ? MAX_FILE_SIZE : 5 * 1024 * 1024; // default 5MB

// Resolve UPLOAD_PATH to an absolute path
const uploadPathInput = env.UPLOAD_PATH || './uploads';
const resolvedUploadPath = path.isAbsolute(uploadPathInput)
  ? uploadPathInput
  : path.resolve(__dirname, '..', uploadPathInput);

// Ensure base upload directory exists with secure permissions (0700)
try {
  if (!fs.existsSync(resolvedUploadPath)) {
    fs.mkdirSync(resolvedUploadPath, { recursive: true, mode: 0o700 });
  }
} catch (err) {
  // If directory creation fails at startup, log and rethrow to fail fast
  console.error('Failed to initialize upload directory:', err);
  throw err;
}

// Optional: per-user file count quota (default 50)
const MAX_FILES_PER_USER = Number.isFinite(env.MAX_FILES_PER_USER)
  ? env.MAX_FILES_PER_USER
  : Number.isFinite(Number.parseInt(process.env.MAX_FILES_PER_USER || '', 10))
  ? Number.parseInt(process.env.MAX_FILES_PER_USER, 10)
  : 50;

// MIME type and extension whitelists
const ALLOWED_MIME_TYPES = (
  env.ALLOWED_MIME_TYPES ||
  [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'image/webp',
  ].join(',')
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_EXTENSIONS = (env.ALLOWED_EXTENSIONS || ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'].join(','))
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

module.exports = {
  MAX_FILE_SIZE: resolvedMaxFileSize,
  UPLOAD_PATH: resolvedUploadPath,
  MAX_FILES_PER_USER,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  // Expose selected, parsed CORS env values for centralized consumption
  CORS: {
    rawOrigin: env.CORS_ORIGIN,
    // Return a trimmed array of allowed origins; if not provided, default to localhost
    allowedOrigins: (env.CORS_ORIGIN || 'http://localhost:3000')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    credentials: (env.CORS_CREDENTIALS || 'false') === 'true',
    maxAge: Number.isFinite(env.CORS_MAX_AGE) ? env.CORS_MAX_AGE : undefined,
    allowedMethods: (env.CORS_ALLOWED_METHODS || 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    allowedHeaders: (env.CORS_ALLOWED_HEADERS || 'Content-Type, Authorization, X-Requested-With, X-Refresh-Token')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  },
};


