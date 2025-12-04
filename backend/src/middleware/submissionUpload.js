const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Make sure uploads folder exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Storage engine for submission files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() + "-submission-" + path.basename(file.originalname)
    );
  },
});

// File filter - allow zip, rar, and other archive files, plus common document types
function fileFilter(req, file, cb) {
  const allowedTypes = [
    // Archive files
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-rar",
    "application/vnd.rar",
    // Document files
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // Other common types
    "application/octet-stream", // For zip files that might not have proper mime type
  ];
  
  const allowedExtensions = [".zip", ".rar", ".7z", ".pdf", ".doc", ".docx"];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error("Only ZIP, RAR, PDF, DOC, DOCX files are allowed!"), false);
  }
}

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

module.exports = upload;

