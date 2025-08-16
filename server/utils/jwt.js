const jwt = require('jsonwebtoken');

function getAlgorithm() {
  return process.env.JWT_ALGORITHM || 'HS256';
}

function getAccessSecrets() {
  const current = process.env.ACCESS_TOKEN_SECRET;
  const previous = process.env.ACCESS_TOKEN_SECRET_PREVIOUS;
  return [current, previous].filter(Boolean);
}

function getRefreshSecrets() {
  const current = process.env.REFRESH_TOKEN_SECRET;
  const previous = process.env.REFRESH_TOKEN_SECRET_PREVIOUS;
  return [current, previous].filter(Boolean);
}

function getAccessExpiry() {
  return process.env.ACCESS_TOKEN_EXPIRES || '15m';
}

function getRefreshExpiry() {
  return process.env.REFRESH_TOKEN_EXPIRES || '7d';
}

function signAccessToken(payload) {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error('ACCESS_TOKEN_SECRET is not set');
  return jwt.sign(payload, secret, {
    algorithm: getAlgorithm(),
    expiresIn: getAccessExpiry(),
  });
}

function signRefreshToken(payload) {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) throw new Error('REFRESH_TOKEN_SECRET is not set');
  return jwt.sign(payload, secret, {
    algorithm: getAlgorithm(),
    expiresIn: getRefreshExpiry(),
  });
}

function verifyWithSecrets(token, secrets) {
  const algorithm = getAlgorithm();
  let lastError;
  for (const secret of secrets) {
    try {
      if (!secret) continue;
      return jwt.verify(token, secret, { algorithms: [algorithm] });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Token verification failed');
}

function verifyAccessToken(token) {
  const secrets = getAccessSecrets();
  return verifyWithSecrets(token, secrets);
}

function verifyRefreshToken(token) {
  const secrets = getRefreshSecrets();
  return verifyWithSecrets(token, secrets);
}

function buildCookieOptions({ maxAgeMs }) {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite = isProd ? 'None' : 'Lax';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite,
    path: '/',
    maxAge: maxAgeMs,
  };
}

function setAuthCookies(res, { accessToken, refreshToken }) {
  // Approximate max-age based on expiry envs
  const accessMs = parseExpiryToMs(getAccessExpiry());
  const refreshMs = parseExpiryToMs(getRefreshExpiry());
  res.cookie('accessToken', accessToken, buildCookieOptions({ maxAgeMs: accessMs }));
  res.cookie('refreshToken', refreshToken, buildCookieOptions({ maxAgeMs: refreshMs }));
}

function clearAuthCookies(res) {
  const base = buildCookieOptions({ maxAgeMs: 0 });
  res.clearCookie('accessToken', base);
  res.clearCookie('refreshToken', base);
}

function parseExpiryToMs(exp) {
  // Supports formats like '15m', '7d', '30d', '3600s', '1h'
  const match = /^\s*(\d+)\s*([smhd])?\s*$/i.exec(exp);
  if (!match) return 0;
  const value = parseInt(match[1], 10);
  const unit = (match[2] || 's').toLowerCase();
  const factors = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * (factors[unit] || 1000);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  getAlgorithm,
  getAccessExpiry,
  getRefreshExpiry,
};


