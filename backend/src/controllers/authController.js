const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../services/emailService");
const axios = require("axios");
const crypto = require("crypto");

const register = async (req, res) => {
  try {
    const {
      username,
      email,
      fullName,
      password,
      roleID,
      instituteID,
      institute,
      captcha,
    } = req.body; // // Verify CAPTCHA // const response = await axios.post( //   `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${captcha}` // ); // if (!response.data.success) { //   return res.status(400).json({ message: "Captcha verification failed" }); // }

    // ✅ 1. Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      let message = "";
      if (existingUser.username === username && existingUser.email === email) {
        message = "Username and email are already taken.";
      } else if (existingUser.username === username) {
        message = "Username is already taken.";
      } else {
        message = "Email is already registered.";
      }
      return res.status(400).json({ message });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate activation token (1 hour expiry)
    const activationToken = crypto.randomBytes(32).toString("hex");
    const activationExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    const newUser = new User({
      username,
      email,
      fullName,
      passwordHash,
      roleID,
      instituteID,
      institute,
      activationToken,
      activationExpires,
    });
    await newUser.save();

    // Send activation email
    const activationLink = `${process.env.FRONTEND_URL}/activate/${activationToken}`;
    await sendEmail(
      email,
      "Activate Your Account",
      `
        <h2>Welcome to Ind - Acd Collaboration Portal!</h2>
        <p>Thank you for registering. Please click the link below to activate your account:</p>
        <a href="${activationLink}" target="_blank" style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Activate Account</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${activationLink}</p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <p>If you didn't create this account, please ignore this email.</p>
      `
    );

    res.json({ 
      message: "Registration successful! Please check your email to activate your account.",
      email: email 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password, institute, roleID, rememberMe } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (user.status === "suspended") {
      return res
        .status(403)
        .json({ message: "Your account has been blocked. Contact admin." });
    }

    // Check if account is activated
    if (!user.isActivated) {
      return res
        .status(403)
        .json({ message: "Please activate your account by clicking the link sent to your email." });
    }

    if (user.institute !== institute)
      return res.status(400).json({ message: "Invalid credentials" });

    if (user.roleID !== roleID)
      return res.status(400).json({ message: "Invalid credentials" }); // 👉 Include role in token

    const token = jwt.sign(
      { id: user._id, role: user.roleID },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    user.isRemembered = rememberMe;
    await user.save(); // 👉 Send cleaned-up user object with profile status

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.roleID, // 👈 IMPORTANT
        institute: user.institute,
        profileCompleted: user.profileCompleted, // 👈 NEW
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // will throw if expired
      req.user = await User.findById(decoded.id).select("-passwordHash");
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Token expired or invalid" });
    }
  }
  res.status(401).json({ message: "No token provided" });
};

// =========================================================================
// 🔄 UPDATED FORGOT PASSWORD
// =========================================================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📨 Forgot password called for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ No user found for email:", email);
      return res
        .status(400)
        .json({ message: "No account found with that email." });
    }

    // 1. Generate the RAW token (sent in email)
    const resetTokenRaw = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 15 * 60 * 1000;

    // 2. Hash the token (stored in DB)
    const resetTokenHashed = crypto
      .createHash("sha256")
      .update(resetTokenRaw)
      .digest("hex");

    // 3. Store the HASHED token and expiry in the database
    user.resetToken = resetTokenHashed; // 🔥 FIX: Store the HASHED token
    user.resetTokenExpiry = tokenExpiry;
    await user.save({ validateBeforeSave: false }); // Bypass validation if needed

    // 4. Use the RAW token for the link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetTokenRaw}`; // 🔥 FIX: Use the RAW token for the link
    console.log("🔗 Generated reset link:", resetLink);

    console.log("📧 Calling sendEmail now...");
    await sendEmail(
      user.email,
      "Password Reset Request",
      `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `
    );
    console.log("✅ sendEmail() finished without error");

    res.json({ message: "Password reset link sent to your email!" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================================================================
// 🔄 UPDATED RESET PASSWORD
// =========================================================================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // This is the RAW token from the URL
    const { newPassword } = req.body;
    console.log("Received token:", token);

    // 1. Hash the incoming RAW token from the URL
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex"); // 2. Find user with the HASHED token and non-expired link

    const user = await User.findOne({
      resetToken: hashedToken, // 🔥 FIX: Query using the HASHED token
      resetTokenExpiry: { $gt: Date.now() - 1000 },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset link." });
    } // 3. Hash new password (this part was correct)

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt); // 4. Invalidate token after successful reset (this part was correct)

    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Activate user account
const activateAccount = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      activationToken: token,
      activationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Invalid or expired activation link. Please register again." 
      });
    }

    // Activate the account
    user.isActivated = true;
    user.activationToken = undefined;
    user.activationExpires = undefined;
    await user.save();

    res.json({ message: "Account activated successfully! You can now log in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Resend activation email
const resendActivation = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with that email." });
    }

    if (user.isActivated) {
      return res.status(400).json({ message: "Account is already activated." });
    }

    // Generate new activation token
    const activationToken = crypto.randomBytes(32).toString("hex");
    const activationExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    user.activationToken = activationToken;
    user.activationExpires = activationExpires;
    await user.save();

    // Send activation email
    const activationLink = `${process.env.FRONTEND_URL}/activate/${activationToken}`;
    await sendEmail(
      email,
      "Activate Your Account",
      `
        <h2>Welcome to TeamColab!</h2>
        <p>Please click the link below to activate your account:</p>
        <a href="${activationLink}" target="_blank" style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Activate Account</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${activationLink}</p>
        <p><strong>This link will expire in 1 hour.</strong></p>
      `
    );

    res.json({ message: "Activation email sent! Please check your email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Suspend user by email
const suspendByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const adminId = req.user?._id; // from protect middleware

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.roleID === "Admin") {
      return res.status(400).json({ message: "Cannot suspend an Admin" });
    }

    user.status = "suspended";
    user.actionBy = adminId;
    user.actionAt = new Date();
    await user.save();

    res.json({ message: `User ${email} has been suspended` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  register,
  login,
  protect,
  forgotPassword,
  resetPassword,
  activateAccount,
  resendActivation,
  suspendByEmail,
};
