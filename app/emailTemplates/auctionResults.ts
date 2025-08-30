// lib/emailTemplates/auctionResults.ts
export const winnerNotificationTemplate = (auctionZone: any, bidAmount: number, position: number) => {
  const getNumberSuffix = (number: number) => {
    if (number === 1) return 'st';
    if (number === 2) return 'nd';
    if (number === 3) return 'rd';
    return 'th';
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Congratulations! You're ${position === 1 ? 'the Winner' : 'a Top Bidder'}</h1>
        </div>
        <div class="content">
          <p>Hello Bidder,</p>
          <p>We're excited to inform you that the auction for <strong>${auctionZone._id}</strong> has ended.</p>
          <p>Your bid of <strong>$${bidAmount}</strong> placed you in <strong>${position}${getNumberSuffix(position)}</strong> place!</p>
          ${position === 1 ? 
            `<p>As the winner, you can now complete your payment to secure the pixels.</p>
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/auctions/${auctionZone._id}" class="button">Complete Payment</a>
            </p>` : 
            `<p>While you didn't win this auction, your strong bid demonstrates your interest in our pixel marketplace.</p>
            <p>Keep an eye out for future auctions that might interest you!</p>`
          }
        </div>
        <div class="footer">
          <p>Thank you for participating in our Pixel Marketplace.</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const participantNotificationTemplate = (auctionZone: any) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f1f5f9; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Auction Results</h1>
        </div>
        <div class="content">
          <p>Hello Bidder,</p>
          <p>The auction for <strong>${auctionZone.name}</strong> has now concluded.</p>
          <p>Thank you for your participation in this auction. While your bid wasn't among the top placements this time, we appreciate your interest in our pixel marketplace.</p>
          <p>We regularly host new auctions, so be sure to check back for future opportunities!</p>
        </div>
        <div class="footer">
          <p>Thank you for participating in our Pixel Marketplace.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};