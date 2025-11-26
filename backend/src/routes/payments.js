import express from "express";
import ChannelSubscription from "../models/ChannelSubscription.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkOrgAdmin } from "../middleware/checkOrgAdmin.js";

const router = express.Router();

// Get payment summary for an organization
router.get("/:orgId/summary", protect, checkOrgAdmin, async (req, res) => {
  try {
    const orgId = req.params.orgId;

    // Fetch the single payment record for this organization
    const payment = await ChannelSubscription.findOne({ organizationId: orgId }).lean();
    console.log("Fetched payment for orgId", orgId, ":", payment);
    if (!payment) {
      return res.json({
        exists: false,
        message: "No payment found for this organization",
      });
    }
    console.log("Payment found:", payment);
    return res.json({
      exists: true,
      payment: {
        id: payment._id,
        plan: payment.plan,
        channel: payment.channel,
        currency: payment.currency,
        status: payment.status,
        date: payment.createdAt,
        metadata: payment.metadata || {},
      },
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
