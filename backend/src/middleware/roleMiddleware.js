function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please sign in to continue.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: you do not have permission to view or perform this action.',
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
};
