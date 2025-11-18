// middleware/academiaMiddleware.js

exports.isAcademia = (req, res, next) => {
  const hasAcademiaRole =
    (req.user && req.user.role === "academia") ||
    (req.user && req.user.roleID === "Academia");

  if (hasAcademiaRole) return next();
  return res.status(403).json({ message: "Access denied. Academia only." });
};
