/**
 * Permission middleware.
 * Checks if the authenticated admin has a specific permission.
 *
 * Logic:
 * - super_admin → always allowed (bypass)
 * - admin with matching permission → allowed
 * - otherwise → 403
 *
 * Usage: router.use('/projects', checkPermission('manage_projects'), projectRoutes);
 */

const checkPermission = (permissionName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Super admin bypasses all permission checks
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Regular admin must have the specific permission
    if (req.user.permissions && req.user.permissions.includes(permissionName)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. You do not have the '${permissionName}' permission.`
    });
  };
};

module.exports = checkPermission;
