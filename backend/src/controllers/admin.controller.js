import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Contact from "../models/Contact.js";

// ---- helpers ----

function resolveDateRange(query) {
  const { range, from, to } = query;

  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      const err = new Error("Invalid 'from' or 'to' date.");
      err.statusCode = 400;
      throw err;
    }
    return { from: fromDate, to: toDate };
  }

  const now = new Date();
  const map = { "7d": 7, "30d": 30, "90d": 90 };
  if (range === "all") return { from: new Date(0), to: now };
  const days = map[range] || 30;
  return { from: new Date(now.getTime() - days * 86400000), to: now };
}

// ---- Overview ----

export async function getOverview(req, res, next) {
  try {
    const [totalBookings, pendingBookings, activeCars, totalCustomers] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: "pending" }),
      Car.countDocuments({ isActive: true }),
      User.countDocuments({ role: "customer" }),
    ]);

    const revenueAgg = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    return res.status(200).json({
      success: true,
      overview: { totalRevenue, totalBookings, pendingBookings, activeCars, totalCustomers },
    });
  } catch (e) {
    next(e);
  }
}

// ---- Revenue per day ----

export async function getRevenueAnalytics(req, res, next) {
  try {
    const { from, to } = resolveDateRange(req.query);
    const rows = await Payment.aggregate([
      { $match: { status: "completed", createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, value: { $sum: "$amount" } } },
      { $sort: { _id: 1 } },
    ]);
    return res.status(200).json({ success: true, range: { from, to }, series: rows.map((r) => ({ date: r._id, value: r.value })) });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
    next(e);
  }
}

// ---- Bookings per day ----

export async function getBookingAnalytics(req, res, next) {
  try {
    const { from, to } = resolveDateRange(req.query);
    const rows = await Booking.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, status: "$bookingStatus" }, count: { $sum: 1 } } },
      { $sort: { "_id.date": 1 } },
    ]);
    const byDate = {};
    for (const r of rows) {
      const d = r._id.date;
      if (!byDate[d]) byDate[d] = { date: d, pending: 0, confirmed: 0, active: 0, completed: 0, cancelled: 0 };
      byDate[d][r._id.status] = r.count;
    }
    return res.status(200).json({ success: true, range: { from, to }, series: Object.values(byDate) });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
    next(e);
  }
}

// ---- Fleet utilization ----

export async function getFleetUtilization(req, res, next) {
  try {
    const { from, to } = resolveDateRange(req.query);
    const rows = await Booking.aggregate([
      { $match: { bookingStatus: { $in: ["pending", "confirmed", "active", "completed"] }, pickupDateTime: { $lte: to }, returnDateTime: { $gte: from } } },
      { $group: { _id: "$car", bookings: { $sum: 1 }, revenue: { $sum: "$total" } } },
      { $sort: { bookings: -1 } },
    ]);
    const carIds = rows.map((r) => r._id);
    const cars = await Car.find({ _id: { $in: carIds } }).select("brand model category dailyPrice");
    const carMap = new Map(cars.map((c) => [c._id.toString(), c]));
    const series = rows.map((r) => {
      const car = carMap.get(r._id.toString());
      return { carId: r._id, label: car ? `${car.brand} ${car.model}` : "Unknown", category: car ? car.category : "unknown", bookings: r.bookings, revenue: r.revenue };
    });
    return res.status(200).json({ success: true, range: { from, to }, series });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
    next(e);
  }
}

// ---- Customer growth ----

export async function getCustomerGrowth(req, res, next) {
  try {
    const { from, to } = resolveDateRange(req.query);
    const rows = await User.aggregate([
      { $match: { role: "customer", createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, value: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    return res.status(200).json({ success: true, range: { from, to }, series: rows.map((r) => ({ date: r._id, value: r.value })) });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
    next(e);
  }
}

// ---- Category distribution ----

export async function getCategoryDistribution(req, res, next) {
  try {
    const rows = await Booking.aggregate([
      { $match: { bookingStatus: { $ne: "cancelled" } } },
      { $lookup: { from: "cars", localField: "car", foreignField: "_id", as: "carDoc" } },
      { $unwind: "$carDoc" },
      { $group: { _id: "$carDoc.category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return res.status(200).json({ success: true, series: rows.map((r) => ({ category: r._id, count: r.count })) });
  } catch (e) {
    next(e);
  }
}

// ---- Top cars ----

export async function getTopCars(req, res, next) {
  try {
    const rows = await Booking.aggregate([
      { $match: { bookingStatus: { $ne: "cancelled" } } },
      { $group: { _id: "$car", bookings: { $sum: 1 }, revenue: { $sum: "$total" } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);
    const carIds = rows.map((r) => r._id);
    const cars = await Car.find({ _id: { $in: carIds } }).select("brand model category");
    const carMap = new Map(cars.map((c) => [c._id.toString(), c]));
    const byRevenue = rows.map((r) => {
      const car = carMap.get(r._id.toString());
      return { carId: r._id, label: car ? `${car.brand} ${car.model}` : "Unknown", bookings: r.bookings, revenue: r.revenue };
    });
    const byBookings = [...byRevenue].sort((a, b) => b.bookings - a.bookings).slice(0, 5);
    return res.status(200).json({ success: true, byRevenue, byBookings });
  } catch (e) {
    next(e);
  }
}

// ---- Recent + pending ----

export async function getRecentBookings(req, res, next) {
  try {
    const [recent, pending] = await Promise.all([
      Booking.find().sort({ createdAt: -1 }).limit(10).populate("car", "brand model images").populate("customer", "name email"),
      Booking.find({ bookingStatus: "pending" }).sort({ createdAt: -1 }).limit(10).populate("car", "brand model images").populate("customer", "name email"),
    ]);
    return res.status(200).json({ success: true, recent, pending });
  } catch (e) {
    next(e);
  }
}

// ---- Customers list ----

export async function getCustomers(req, res, next) {
  try {
    const { page = "1", limit = "20", search = "", accountStatus } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = { role: "customer" };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }];
    }
    if (accountStatus) filter.accountStatus = accountStatus;

    const [customers, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, count: customers.length, total, page: pageNum, pages: Math.ceil(total / limitNum), customers });
  } catch (e) {
    next(e);
  }
}

// ---- Customer Stats ----
export async function getCustomerStats(req, res, next) {
  try {
    const [total, active, suspended] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "customer", accountStatus: "active" }),
      User.countDocuments({ role: "customer", accountStatus: "suspended" }),
    ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = await User.countDocuments({
      role: "customer",
      createdAt: { $gte: startOfMonth },
    });

    return res.status(200).json({
      success: true,
      stats: { total, active, suspended, newThisMonth },
    });
  } catch (e) {
    next(e);
  }
}

// ---- Get Single Customer Details ----
export async function getCustomerDetails(req, res, next) {
  try {
    const customer = await User.findById(req.params.id).select("-password");
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    const bookings = await Booking.find({ customer: customer._id })
      .sort({ createdAt: -1 })
      .populate("car", "brand model year images category dailyPrice");

    const totalBookings = bookings.length;
    const totalSpent = bookings
      .filter(b => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + b.total, 0);
    const activeBookings = bookings.filter(
      b => b.bookingStatus === "pending" || b.bookingStatus === "confirmed" || b.bookingStatus === "active"
    ).length;

    return res.status(200).json({
      success: true,
      customer,
      bookings,
      stats: { totalBookings, totalSpent, activeBookings },
    });
  } catch (e) {
    next(e);
  }
}

// ---- Analytics Summary ----
export async function getAnalyticsSummary(req, res, next) {
  try {
    const { from, to } = resolveDateRange(req.query);
    const duration = to.getTime() - from.getTime();
    const prevTo = new Date(from.getTime() - 1);
    const prevFrom = new Date(prevTo.getTime() - duration);

    const currentBookings = await Booking.find({ createdAt: { $gte: from, $lte: to } });
    const currentRevenue = await Payment.aggregate([
      { $match: { status: "completed", createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const prevBookings = await Booking.find({ createdAt: { $gte: prevFrom, $lte: prevTo } });
    const prevRevenue = await Payment.aggregate([
      { $match: { status: "completed", createdAt: { $gte: prevFrom, $lte: prevTo } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalRevenue = currentRevenue[0]?.total || 0;
    const totalBookings = currentBookings.length;
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    const completedBookings = currentBookings.filter(b => b.bookingStatus === "completed").length;
    const cancelledBookings = currentBookings.filter(b => b.bookingStatus === "cancelled").length;
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;
    const previousRevenue = prevRevenue[0]?.total || 0;
    const previousBookings = prevBookings.length;

    let revenueChange = 0;
    if (previousRevenue > 0) revenueChange = ((totalRevenue - previousRevenue) / previousRevenue) * 100;
    let bookingsChange = 0;
    if (previousBookings > 0) bookingsChange = ((totalBookings - previousBookings) / previousBookings) * 100;

    return res.status(200).json({
      success: true,
      range: { from, to, prevFrom, prevTo },
      summary: {
        totalRevenue,
        totalBookings,
        avgBookingValue: Math.round(avgBookingValue),
        completedBookings,
        cancellationRate: Math.round(cancellationRate * 10) / 10,
        previousRevenue,
        previousBookings,
        revenueChange: Math.round(revenueChange * 10) / 10,
        bookingsChange: Math.round(bookingsChange * 10) / 10
      }
    });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
    next(e);
  }
}

// ---- Fleet Stats ----
export async function getFleetStats(req, res, next) {
  try {
    const [totalVehicles, activeVehicles, featuredVehicles] = await Promise.all([
      Car.countDocuments(),
      Car.countDocuments({ isActive: true }),
      Car.countDocuments({ isFeatured: true }),
    ]);

    const avgPriceAgg = await Car.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgPrice: { $avg: "$dailyPrice" } } }
    ]);
    const avgDailyPrice = avgPriceAgg[0]?.avgPrice || 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalVehicles,
        activeVehicles,
        inactiveVehicles: totalVehicles - activeVehicles,
        featuredVehicles,
        avgDailyPrice: Math.round(avgDailyPrice),
      },
    });
  } catch (e) {
    next(e);
  }
}

// ---- Booking Stats ----
export async function getBookingStats(req, res, next) {
  try {
    const [total, pending, confirmed, active, completed, cancelled] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: "pending" }),
      Booking.countDocuments({ bookingStatus: "confirmed" }),
      Booking.countDocuments({ bookingStatus: "active" }),
      Booking.countDocuments({ bookingStatus: "completed" }),
      Booking.countDocuments({ bookingStatus: "cancelled" }),
    ]);

    return res.status(200).json({
      success: true,
      stats: { total, pending, confirmed, active, completed, cancelled },
    });
  } catch (e) {
    next(e);
  }
}

// ---- Booking Analytics (Distribution + Trends) ----
export async function getAdminBookingAnalytics(req, res, next) {
  try {
    const { from, to } = resolveDateRange(req.query);

    const distribution = await Booking.aggregate([
      { $group: { _id: "$bookingStatus", count: { $sum: 1 } } },
    ]);
    const statusDistribution = distribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const trends = await Booking.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          value: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      range: { from, to },
      statusDistribution,
      trends: trends.map((t) => ({ date: t._id, value: t.value })),
    });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
    next(e);
  }
}

// ---- Get All Messages ----
export async function getMessages(req, res, next) {
  try {
    const { page = "1", limit = "20", search = "", status = "" } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: rx }, { email: rx }, { subject: rx }];
    }

    const [messages, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Contact.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      messages,
    });
  } catch (e) {
    next(e);
  }
}

// ---- Get Single Message ----
export async function getMessage(req, res, next) {
  try {
    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }
    return res.status(200).json({ success: true, message });
  } catch (e) {
    next(e);
  }
}

// ---- Update Message Status ----
export async function updateMessageStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!["new", "read", "replied"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }
    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }
    message.status = status;
    await message.save();
    return res.status(200).json({ success: true, message: "Status updated.", data: message });
  } catch (e) {
    next(e);
  }
}

// ---- Get Message Stats ----
export async function getMessageStats(req, res, next) {
  try {
    const [total, newCount, readCount, repliedCount] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: "new" }),
      Contact.countDocuments({ status: "read" }),
      Contact.countDocuments({ status: "replied" }),
    ]);
    return res.status(200).json({
      success: true,
      stats: { total, new: newCount, read: readCount, replied: repliedCount },
    });
  } catch (e) {
    next(e);
  }
}