function isAuthenticated (req, res, next) {
    if (req.session.user) {
        return next();
      }
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
};

module.exports = {isAuthenticated};