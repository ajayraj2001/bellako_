// ===== src/services/email.service.js =====
const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendOTPEmail(email, otp) {
        const mailOptions = {
            from: `"${process.env.APP_NAME}" <${process.env.SMTP_FROM}>`,
            to: email,
            subject: 'Your Login OTP',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; border-radius: 0 0 10px 10px; }
            .otp-box { background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #6c757d; font-size: 14px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${process.env.APP_NAME}</h1>
            </div>
            <div class="content">
              <h2>Welcome!</h2>
              <p>Your one-time password (OTP) for login is:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
              <p>If you didn't request this OTP, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            logger.info(`OTP email sent to ${email}`);
        } catch (error) {
            logger.error('Email sending failed:', error);
            throw new ApiError(500, 'Failed to send OTP email');
        }
    }
}

module.exports = new EmailService();