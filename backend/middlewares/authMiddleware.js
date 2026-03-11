const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    let message = 'Invalid token.';
    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired. Please log in again.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token signature or format.';
    } else {
      message = error.message || 'Authentication failed.';
    }
    return res.status(401).json({ success: false, message });
  }
};

module.exports = authMiddleware;
