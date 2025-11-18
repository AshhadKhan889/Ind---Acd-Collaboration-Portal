const express = require("express");
const { register, login, forgotPassword, resetPassword, activateAccount, resendActivation } = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/activate/:token", activateAccount);
router.post("/resend-activation", resendActivation);

module.exports = router;
