import { NextResponse } from "next/server";
import dbConnect from "@/app/lib/db";
import User from "@/app/lib/models/userModel";
import Bid from "@/app/lib/models/bidModel";
import Transaction from "@/app/lib/models/transactionModel";
import { getSession } from "@/app/lib/auth";

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Verify admin
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "year"; // default yearly
    const specificYear = searchParams.get("year");

    // Common stats
    const [totalTransactions, activeBids, totalUsers, revenueResult, transactions] = await Promise.all([
      Transaction.countDocuments({ status: "completed" }),
      Bid.countDocuments({ status: "active" }),
      User.countDocuments({ isAdmin: false }),
      Transaction.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.find({ status: "completed" })
        .sort({ transactionDate: -1 })
        .limit(5)
        .populate("userId", "name email")
        .populate("productId", "title"),
    ]);

    const revenue = revenueResult[0]?.total || 0;

    let revenueData;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    // NEW: Get available years for dropdown
    const yearsResult = await Transaction.aggregate([
      {
        $group: {
          _id: { $year: "$transactionDate" }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    const availableYears = yearsResult.map(y => y._id).filter(y => y !== null);

    if (filter === "year" || filter === "prevYear" || filter === "specificYear") {
      let year;
      
      if (filter === "specificYear" && specificYear) {
        year = parseInt(specificYear, 10);
      } else {
        const currentYear = new Date().getFullYear();
        year = filter === "prevYear" ? currentYear - 1 : currentYear;
      }

      const monthlyRevenue = await Transaction.aggregate([
        {
          $match: {
            status: "completed",
            transactionDate: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$transactionDate" },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id": 1 } },
      ]);

      const revenueByMonth = Array(12).fill(0);
      monthlyRevenue.forEach((m) => {
        if (m._id >= 1 && m._id <= 12) {
          revenueByMonth[m._id - 1] = m.total;
        }
      });

      revenueData = {
        labels: months,
        datasets: [
          {
            label: `Revenue ${year} ($)`,
            data: revenueByMonth,
            backgroundColor: filter === "prevYear" ? 
              "rgba(239, 68, 68, 0.8)" : 
              filter === "specificYear" ?
                "rgba(234, 179, 8, 0.8)" :
                "rgba(79, 70, 229, 0.8)",
          },
        ],
      };
    } else if (filter === "today") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const hourlyRevenue = await Transaction.aggregate([
        {
          $match: {
            status: "completed",
            transactionDate: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: { $hour: "$transactionDate" },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id": 1 } },
      ]);

      const revenueByHour = Array(24).fill(0);
      hourlyRevenue.forEach((h) => {
        if (h._id >= 0 && h._id <= 23) {
          revenueByHour[h._id] = h.total;
        }
      });

      revenueData = {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [
          {
            label: "Revenue Today ($)",
            data: revenueByHour,
            backgroundColor: "rgba(34, 197, 94, 0.8)",
          },
        ],
      };
    } else if (filter === "allTime") {
      // All-time revenue data
      const yearlyRevenue = await Transaction.aggregate([
        {
          $match: {
            status: "completed"
          }
        },
        {
          $group: {
            _id: { $year: "$transactionDate" },
            total: { $sum: "$amount" }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      const labels = yearlyRevenue.map(y => y._id.toString());
      const data = yearlyRevenue.map(y => y.total);

      revenueData = {
        labels,
        datasets: [
          {
            label: "All-Time Revenue ($)",
            data,
            backgroundColor: "rgba(234, 179, 8, 0.8)",
          },
        ],
      };
    }

    
    return NextResponse.json({
      totalTransactions,
      activeBids,
      totalUsers,
      revenue,
      revenueData,
      recentTransactions: transactions.map((t) => ({
        id: t._id,
        userName: t.userId?.name || "Unknown",
        productName: t.productId?.title || "Unknown",
        amount: t.amount,
        date: new Date(t.transactionDate).toLocaleDateString(),
        status: t.status,
      })),
      availableYears, 
      currentFilter: filter,
      specificYear: filter === "specificYear" ? specificYear : null,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}