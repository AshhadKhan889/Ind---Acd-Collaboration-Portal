require("dotenv").config();
const nodemailer = require("nodemailer");

(async () => {
  try {
    console.log("📧 Attempting to connect to Gmail...");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"SMTP Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send to yourself
      subject: "✅ Gmail SMTP Test",
      text: "If you see this, your Gmail setup works!",
    });

    console.log("✅ Email sent successfully!");
    console.log("📨 Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ SMTP error details:");
    console.error(error);
  }
})();
