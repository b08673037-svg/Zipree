import { Router } from "express";
import {
  getOverview,
  getRevenueAnalytics,
  getBookingAnalytics,
  getFleetUtilization,
  getCustomerGrowth,
  getCategoryDistribution,
  getTopCars,
  getRecentBookings,
  getCustomers,
  getAnalyticsSummary,
  getFleetStats,
  getBookingStats,
  getAdminBookingAnalytics,
  getCustomerStats,
  getCustomerDetails,
  getMessages,
  getMessage,
  updateMessageStatus,
  getMessageStats,
} from "../controllers/admin.controller.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, restrictTo("admin"));

router.get("/overview", getOverview);
router.get("/analytics/summary", getAnalyticsSummary);
router.get("/analytics/revenue", getRevenueAnalytics);
router.get("/analytics/bookings", getBookingAnalytics);
router.get("/analytics/fleet-utilization", getFleetUtilization);
router.get("/analytics/customers", getCustomerGrowth);
router.get("/analytics/categories", getCategoryDistribution);
router.get("/analytics/top-cars", getTopCars);
router.get("/recent", getRecentBookings);
router.get("/fleet-stats", getFleetStats);
router.get("/bookings/stats", getBookingStats);
router.get("/bookings/analytics", getAdminBookingAnalytics);
router.get("/customers/stats", getCustomerStats);
router.get("/customers/:id", getCustomerDetails);
router.get("/customers", getCustomers);
router.get("/messages/stats", getMessageStats);
router.get("/messages/:id", getMessage);
router.patch("/messages/:id/status", updateMessageStatus);
router.get("/messages", getMessages);

export default router;