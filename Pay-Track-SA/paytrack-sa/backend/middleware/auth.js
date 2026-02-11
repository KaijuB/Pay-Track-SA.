const jwt = require('jsonwebtoken');
const { config } = require('../config');

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const [, token] = auth.split(' ');
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid/expired token' });
  }
}

module.exports = { requireAuth };
