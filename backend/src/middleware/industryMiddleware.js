// middleware/industryMiddleware.js

exports.isIndustryOfficial = (req, res, next) => {
  const hasIndustryRole =
    (req.user && req.user.role === "industry official") ||
    (req.user && req.user.roleID === "Industry Official");

  if (hasIndustryRole) return next();
  return res.status(403).json({ message: "Access denied. Industry Official only." });
};


