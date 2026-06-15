const nodemailer = require("nodemailer");

// Create transporter using Gmail or any SMTP service
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use app password for Gmail
  },
});

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    // Construct reset URL (frontend should handle this)
    const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - Teyzix Marketplace",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>You requested to reset your password. Please click the link below to proceed:</p>
        <a href="${resetURL}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetURL}</p>
        <p><strong>This link will expire in 30 minutes.</strong></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>Teyzix Marketplace Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send email: " + error.message);
  }
};

module.exports = { sendPasswordResetEmail };
