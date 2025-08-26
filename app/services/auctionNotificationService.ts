import Bid from '../lib/models/bidModel';
import AuctionNotification from '../lib/models/auctionNotification';
import User from '../lib/models/userModel';
import PixelConfig from '@/app/lib/models/pixelModel';
import { winnerNotificationTemplate, participantNotificationTemplate } from '../emailTemplates/auctionResults';
import { sendEmail } from '../lib/email';

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

        const notificationPromises = [];

        if (bids[0]) {
          notificationPromises.push(
            AuctionNotification.create({
              auctionZoneId: auction._id,
              bidId: bids[0]._id,
              userId: bids[0].userId._id,
              rank: 1,
              notificationType: 'winner',
              scheduledDate: new Date(),
              sent: false,
            })
          );
        }

        if (bids[1]) {
          const secondPlaceDate = new Date();
          secondPlaceDate.setDate(secondPlaceDate.getDate() + 1);
          notificationPromises.push(
            AuctionNotification.create({
              auctionZoneId: auction._id,
              bidId: bids[1]._id,
              userId: bids[1].userId._id,
              rank: 2,
              notificationType: 'runner_up',
              scheduledDate: secondPlaceDate,
              sent: false,
            })
          );
        }

        if (bids[2]) {
          const thirdPlaceDate = new Date();
          thirdPlaceDate.setDate(thirdPlaceDate.getDate() + 2);
          notificationPromises.push(
            AuctionNotification.create({
              auctionZoneId: auction._id,
              bidId: bids[2]._id,
              userId: bids[2].userId._id,
              rank: 3,
              notificationType: 'runner_up',
              scheduledDate: thirdPlaceDate,
              sent: false,
            })
          );
        }

        if (bids.length > 3) {
          const participantDate = new Date();
          participantDate.setDate(participantDate.getDate() + 3);

          for (let i = 3; i < bids.length; i++) {
            notificationPromises.push(
              AuctionNotification.create({
                auctionZoneId: auction._id,
                bidId: bids[i]._id,
                userId: bids[i].userId._id,
                rank: i + 1,
                notificationType: 'participant',
                scheduledDate: participantDate,
                sent: false,
              })
            );
          }
        }

        await Promise.all(notificationPromises);

        await PixelConfig.updateOne(
          { 'auctionZones._id': auction._id },
          { $set: { 'auctionZones.$.notificationsProcessed': true } }
        );

        console.log(`Scheduled notifications for auction ${auction._id}`);
      } catch (error) {
        console.error(`Error processing auction ${auction._id}:`, error);
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

    for (const notification of notifications) {
      try {
        const user = await User.findById(notification.userId);
        const pixelConfig = await PixelConfig.findOne();
        const auction = pixelConfig.auctionZones.id(notification.auctionZoneId);

        if (!user || !auction) continue;

        let emailSubject, emailHtml;

        if (notification.notificationType === 'winner') {
          emailSubject = `Congratulations! You won the auction for ${auction.name}`;
          emailHtml = winnerNotificationTemplate(
            auction,
            notification.bidId.bidAmount,
            notification.rank
          );
        } else if (notification.notificationType === 'runner_up') {
          emailSubject = `You placed ${notification.rank}${this.getNumberSuffix(
            notification.rank
          )} in ${auction.name} auction`;
          emailHtml = winnerNotificationTemplate(
            auction,
            notification.bidId.bidAmount,
            notification.rank
          );
        } else {
          emailSubject = `Auction results for ${auction.name}`;
          emailHtml = participantNotificationTemplate(auction);
        }

        await sendEmail({
          to: user.email,
          subject: emailSubject,
          html: emailHtml,
          text: `Auction results for ${auction.name}. Please view the HTML version for details.`,
        });

        notification.sent = true;
        notification.sentDate = new Date();
        await notification.save();

        console.log(`Sent ${notification.notificationType} notification to ${user.email}`);
      } catch (error) {
        console.error(`Error sending notification ${notification._id}:`, error);
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
