import Bid from '../lib/models/bidModel';
import AuctionNotification from '../lib/models/auctionNotification';
import User from '../lib/models/userModel';
import PixelConfig from '../lib/models/pixelModel';
import { winnerNotificationTemplate, participantNotificationTemplate } from '../emailTemplates/auctionResults';
import { sendEmail } from '../lib/email';

const ADMIN_BCC_EMAIL = "Makokemos@gmail.com";

class AuctionNotificationService {
  async processEndedAuctions() {
    const now = new Date();
    const pixelConfig = await PixelConfig.findOne();
    if (!pixelConfig) return;

    const endedAuctions = pixelConfig.auctionZones.filter(
      (zone: any) => new Date(zone.expiryDate) < now && !zone.notificationsProcessed
    );

    for (const auction of endedAuctions) {
      try {
        const bids = await Bid.find({ zoneId: auction._id })
          .sort({ bidAmount: -1, createdAt: 1 })
          .populate('userId', 'email');

        if (!bids.length) continue;

        const createNotification = (bid: any, rank: number, type: string, daysAfter = 0) => {
          const scheduledDate = new Date();
          scheduledDate.setDate(scheduledDate.getDate() + daysAfter);
          return AuctionNotification.create({
            auctionZoneId: auction._id,
            bidId: bid._id,
            userId: bid.userId._id,
            rank,
            notificationType: type,
            scheduledDate,
            sent: false,
          });
        };

        const notificationPromises = [];

        if (bids[0]) notificationPromises.push(createNotification(bids[0], 1, 'winner'));
        if (bids[1]) notificationPromises.push(createNotification(bids[1], 2, 'runner_up', 1));
        if (bids[2]) notificationPromises.push(createNotification(bids[2], 3, 'runner_up', 2));

        for (let i = 3; i < bids.length; i++) {
          notificationPromises.push(createNotification(bids[i], i + 1, 'participant', 3));
        }

        await Promise.all(notificationPromises);

        await PixelConfig.updateOne(
          { 'auctionZones._id': auction._id },
          { $set: { 'auctionZones.$.notificationsProcessed': true } }
        );

        console.log(`✅ Scheduled notifications for auction ${auction._id}`);
      } catch (error) {
        console.error(`❌ Error processing auction ${auction._id}:`, error);
      }
    }
  }

  async processScheduledNotifications() {
    const now = new Date();

    const notifications = await AuctionNotification.find({
      sent: false,
      scheduledDate: { $lte: now },
    })
      .populate('userId', 'email')
      .populate('bidId');

    if(notifications.length!==0){
      for (const notification of notifications) {
      try {
        const user: any = notification.userId;
        if (!user?.email) continue;

        const pixelConfig = await PixelConfig.findOne();
        const auction = pixelConfig?.auctionZones.id(notification.auctionZoneId);
        if (!auction) continue;

        let emailSubject: string;
        let emailHtml: string;

        if (notification.notificationType === 'winner') {
          emailSubject = `🎉 Congratulations! You won the auction for ${auction.title || notification.auctionZoneId}`;
          emailHtml = winnerNotificationTemplate(user, auction, notification.bidId.bidAmount, notification.rank);
        } else if (notification.notificationType === 'runner_up') {
          emailSubject = `You placed ${notification.rank}${this.getNumberSuffix(notification.rank)} in the ${auction.title || notification.auctionZoneId} auction`;
          emailHtml = winnerNotificationTemplate(user, auction, notification.bidId.bidAmount, notification.rank);
        } else {
          emailSubject = `Auction results for ${auction.title || notification.auctionZoneId}`;
          emailHtml = participantNotificationTemplate(user, auction);
        }

        await sendEmail({
          to: user.email,
          bcc: ADMIN_BCC_EMAIL,
          subject: emailSubject,
          html: emailHtml,
          text: `Auction results for ${notification.auctionZoneId}.`,
        });

        notification.sent = true;
        notification.sentDate = new Date();
        await notification.save();

        console.log(`📧 Sent ${notification.notificationType} notification to ${user.email}`);
      } catch (error) {
        console.error(`❌ Error sending notification ${notification._id}:`, error);
      }
    }
    }
  }

  getNumberSuffix(number: number) {
    if (number === 1) return 'st';
    if (number === 2) return 'nd';
    if (number === 3) return 'rd';
    return 'th';
  }
}

export default AuctionNotificationService;
