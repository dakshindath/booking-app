const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

function admin(req, res, next) {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Admin access denied' });
  }
}

module.exports = { auth, admin };
