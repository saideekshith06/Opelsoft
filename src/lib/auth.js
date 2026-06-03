import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'opelsoft_dev_secret_key_change_in_production';

/**
 * Hash a password using Node.js native scrypt algorithm.
 * @param {string} password 
 * @returns {string} hashed password in format 'salt:derivedKeyHex'
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verify a password against a hash.
 * @param {string} password 
 * @param {string} hash 
 * @returns {boolean}
 */
export function verifyPassword(password, hash) {
  if (!hash || !hash.includes(':')) {
    return false;
  }
  const [salt, key] = hash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
}

/**
 * Generate a JWT token with base64url encoding.
 * @param {object} payload 
 * @param {number} expiresInSeconds (defaults to 7 days)
 * @returns {string} Signed JWT
 */
export function signToken(payload, expiresInSeconds = 7 * 24 * 60 * 60) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };
  
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url');
    
  return `${headerB64}.${payloadB64}.${signature}`;
}

/**
 * Verify and parse a JWT token.
 * @param {string} token 
 * @returns {object|null} payload or null if invalid/expired
 */
export function verifyToken(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [headerB64, payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Extract and verify authenticated user from request cookie header.
 * @param {Request} request 
 * @returns {object|null} decoded user payload or null if unauthenticated
 */
export function getAuthUser(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const parts = cookie.split('=');
      if (parts[0]) {
        acc[parts[0].trim()] = (parts[1] || '').trim();
      }
      return acc;
    }, {});
    
    const token = cookies['opelsoft_session'];
    if (!token) return null;
    
    return verifyToken(token);
  } catch (err) {
    return null;
  }
}
