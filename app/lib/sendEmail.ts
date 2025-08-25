import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}
    
// Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (options: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `Pixel Marketplace <${process.env.MAIL_FROM}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    });

    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};