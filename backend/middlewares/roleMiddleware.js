const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
    }

    // super_admin can access all admin routes
    if (req.user.role === 'super_admin' && allowedRoles.includes('admin')) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = roleMiddleware;
