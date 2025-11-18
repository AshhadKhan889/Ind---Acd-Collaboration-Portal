// src/middleware/studentMiddleware.js
const isStudent = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (req.user.roleID !== "Student") {
    return res.status(403).json({ message: "Student access required" });
  }
  next();
};

module.exports = { isStudent };
