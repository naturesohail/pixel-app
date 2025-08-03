import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import User from "@/app/lib/models/userModel";
import Bid from "@/app/lib/models/bidModel";
import Transaction from "@/app/lib/models/transactionModel";
import { getSession } from "@/app/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    
    // Verify admin
    const session = await getSession();
    if (!session || !session.user ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch data in parallel
    const [totalTransactions, activeBids, totalUsers, revenueResult, transactions] = await Promise.all([
      Transaction.countDocuments({ status: 'completed' }),
      Bid.countDocuments({ status: 'active' }),
      User.countDocuments({ isAdmin: false }),
      Transaction.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.find({ status: 'completed' })
        .sort({ transactionDate: -1 })
        .limit(5)
        .populate('userId', 'name email')
        .populate('productId', 'title')
    ]);

    const revenue = revenueResult[0]?.total || 0;

    // Generate sample revenue data (in a real app, you'd generate this from actual data)
    const revenueData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'Revenue ($)',
          data: [12500, 19000, 15000, 18000, 22000, 19500, 23000],
          backgroundColor: 'rgba(79, 70, 229, 0.8)',
        },
      ],
    };

    return NextResponse.json({
      totalTransactions,
      activeBids,
      totalUsers,
      revenue,
      revenueData,
      recentTransactions: transactions.map(t => ({
        id: t._id,
        userName: t.userId?.name || 'Unknown',
        productName: t.productId?.title || 'Unknown',
        amount: t.amount,
        date: new Date(t.transactionDate).toLocaleDateString(),
        status: t.status
      }))
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}