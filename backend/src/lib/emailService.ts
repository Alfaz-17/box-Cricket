import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    const mailOptions = {
      from: `"BookMyBox" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
    return true;
  } catch (error: any) {
    logger.error(`Failed to send email to ${to}`, error);
    return false;
  }
};
