const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetEmail = async (toEmail, resetToken) => {
  const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const mailOptions = {
    from: `"NeighbourNet Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Password Reset Link",
    html: `<p>You requested a password reset. Click below:</p>
           <a href="${resetURL}">${resetURL}</a>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendResetEmail;
