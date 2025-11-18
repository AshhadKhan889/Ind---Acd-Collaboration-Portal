// src/middleware/adminMiddleware.js
const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.roleID !== "Admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { isAdmin };
