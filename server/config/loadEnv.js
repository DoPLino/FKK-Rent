const path = require('path');
const { config: loadDotenvFlow } = require('dotenv-flow');
const { z } = require('zod');

// Load environment files based on NODE_ENV using dotenv-flow
const rootDir = path.resolve(__dirname, '..');
loadDotenvFlow({
  path: rootDir,
  silent: true,
});

// Define validation schema with environment-aware requirements
const BaseSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .regex(/^\d+$/, { message: 'PORT must be an integer string' })
    .transform((v) => parseInt(v, 10))
    .default('3001')
    .transform((v) => (typeof v === 'string' ? parseInt(v, 10) : v)),
  MONGODB_URI: z.string().optional(),

  // JWT
  JWT_ALGORITHM: z.enum(['HS256', 'HS384', 'HS512']).default('HS256'),
  ACCESS_TOKEN_SECRET: z.string().optional(),
  ACCESS_TOKEN_SECRET_PREVIOUS: z.string().optional(),
  ACCESS_TOKEN_EXPIRES: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().optional(),
  REFRESH_TOKEN_SECRET_PREVIOUS: z.string().optional(),
  REFRESH_TOKEN_EXPIRES: z.string().default('7d'),

  // Email (optional)
  EMAIL_FROM: z.string().optional(),
  // SMTP (use with OAuth2; avoid plain passwords)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .regex(/^\d+$/,{ message: 'SMTP_PORT must be an integer string' })
    .transform((v) => parseInt(v, 10))
    .optional(),
  SMTP_SECURE: z.enum(['true', 'false']).optional(),
  SMTP_USER: z.string().optional(),
  // OAuth2 for SMTP
  OAUTH_CLIENT_ID: z.string().optional(),
  OAUTH_CLIENT_SECRET: z.string().optional(),
  OAUTH_REFRESH_TOKEN: z.string().optional(),
  // Transactional provider API (preferred for production)
  SENDGRID_API_KEY: z.string().optional(),

  // OpenAI (optional)
  OPENAI_API_KEY: z.string().optional(),

  // Uploads
  MAX_FILE_SIZE: z
    .string()
    .regex(/^\d+$/, { message: 'MAX_FILE_SIZE must be an integer in bytes' })
    .transform((v) => parseInt(v, 10))
    .optional(),
  UPLOAD_PATH: z.string().optional(),
  MAX_FILES_PER_USER: z
    .string()
    .regex(/^\d+$/, { message: 'MAX_FILES_PER_USER must be an integer' })
    .transform((v) => parseInt(v, 10))
    .optional(),
  ALLOWED_MIME_TYPES: z.string().optional(),
  ALLOWED_EXTENSIONS: z.string().optional(),

  // Security / CORS
  CORS_ORIGIN: z.string().optional(),
  CORS_CREDENTIALS: z.enum(['true', 'false']).optional(),
  // Additional CORS options (optional)
  CORS_MAX_AGE: z
    .string()
    .regex(/^\d+$/, { message: 'CORS_MAX_AGE must be an integer (seconds)' })
    .transform((v) => parseInt(v, 10))
    .optional(),
  CORS_ALLOWED_METHODS: z.string().optional(),
  CORS_ALLOWED_HEADERS: z.string().optional(),

  // Development convenience flags
  AUTH_DISABLE: z.enum(['true', 'false']).optional(),
});

const schema = BaseSchema.superRefine((env, ctx) => {
  const isProduction = env.NODE_ENV === 'production';
  // Require secrets and DB URI in production
  if (isProduction) {
    if (!env.MONGODB_URI) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['MONGODB_URI'], message: 'MONGODB_URI is required in production' });
    if (!env.ACCESS_TOKEN_SECRET) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['ACCESS_TOKEN_SECRET'], message: 'ACCESS_TOKEN_SECRET is required in production' });
    if (!env.REFRESH_TOKEN_SECRET) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['REFRESH_TOKEN_SECRET'], message: 'REFRESH_TOKEN_SECRET is required in production' });
    if (!env.CORS_ORIGIN) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['CORS_ORIGIN'], message: 'CORS_ORIGIN is required in production' });
  }
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `- ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  // Fail fast with clear message
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

// Export validated environment with normalized types for consumers that want it
const env = parsed.data;
module.exports = { env };


