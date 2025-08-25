export const emailTemplates = {
  auctionZoneCreated: (zoneData: any, userEmail: string) => ({
    subject: `New Auction Zone Created - ${zoneData.width}x${zoneData.height}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #fff; border: 1px solid #dee2e6; }
          .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 14px; }
          .zone-details { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Auction Zone Created</h2>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>A new auction zone has been successfully created with the following details:</p>
            
            <div class="zone-details">
              <h3>Zone Information</h3>
              <p><strong>Dimensions:</strong> ${zoneData.width} x ${zoneData.height} pixels</p>
              <p><strong>Position:</strong> X: ${zoneData.x}, Y: ${zoneData.y}</p>
              <p><strong>Total Pixels:</strong> ${zoneData.totalPixels}</p>
              <p><strong>Pixel Price:</strong> $${zoneData.pixelPrice}</p>
              <p><strong>Buy Now Price:</strong> $${zoneData.buyNowPrice}</p>
              <p><strong>Expiry Date:</strong> ${new Date(zoneData.expiryDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${zoneData.status}</p>
            </div>

            <p>The auction will be active until the expiry date. You can manage your auction zone from your dashboard.</p>
            
            <p>Best regards,<br>The Auction Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),
  
  adminNotification: (zoneData: any, userEmail: string) => ({
    subject: `[ADMIN] New Auction Zone Created by ${userEmail}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f4f4f4; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #fff; border: 1px solid #ddd; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .alert { background: #fff3cd; padding: 10px; border: 1px solid #ffeaa7; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Admin Notification: New Auction Zone</h2>
          </div>
          <div class="content">
            <div class="alert">
              <strong>Administrative Notification</strong>
            </div>
            
            <p>A new auction zone has been created by user: <strong>${userEmail}</strong></p>
            
            <h3>Zone Details:</h3>
            <ul>
              <li><strong>Dimensions:</strong> ${zoneData.width}x${zoneData.height}</li>
              <li><strong>Position:</strong> (${zoneData.x}, ${zoneData.y})</li>
              <li><strong>Total Pixels:</strong> ${zoneData.totalPixels}</li>
              <li><strong>Buy Now Price:</strong> $${zoneData.buyNowPrice}</li>
              <li><strong>Expiry:</strong> ${new Date(zoneData.expiryDate).toLocaleString()}</li>
              <li><strong>Products:</strong> ${zoneData.productIds?.length || 0} products</li>
            </ul>
            
            <p>Please review this auction zone in the admin dashboard.</p>
          </div>
          <div class="footer">
            <p>Auction System Admin Notification</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};
