import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '587'),
//   secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass:process.env.MAIL_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `Bid Notification <${process.env.MAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    });

    console.log(`Email sent to ${options.to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${options.to}:`, error);
    throw error;
  }
};

export const bidNotificationTemplate = (zoneId: string, bidAmount: number) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">New Bid Alert!</h2>
    <p>A new bid has been placed on zone <strong>${zoneId}</strong> with an amount of <strong>$${bidAmount.toFixed(2)}</strong>.</p>
    <p>Your bid has been outbid. To stay competitive, consider increasing your bid.</p>
    <div style="margin-top: 30px; text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/zones/${zoneId}" 
         style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px;">
        View Zone Details
      </a>
    </div>
    <p style="margin-top: 30px; color: #666; font-size: 14px;">
      You received this email because you have an active bid on this zone. 
    </p>
  </div>
`;