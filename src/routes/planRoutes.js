import express from "express";
import ChannelPlan from "../models/ChannelPlan.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/plans/:channel
 * Get all active plans for a specific channel (e.g. WhatsApp)
 */
router.get("/:channel", protect, async (req, res) => {
  try {
    const { channel } = req.params;
    const plans = await ChannelPlan.find({ channel, isActive: true }).sort({ price: 1 });
    res.json(plans);
  } catch (err) {
    console.error("Error fetching plans:", err);
    res.status(500).json({ message: "Error fetching channel plans" });
  }
});

/**
 * POST /api/plans
 * Create a new plan (for admin only)
 */
router.post("/", protect, async (req, res) => {
  try {
    const { channel, name, description, price, currency, durationDays } = req.body;

    const newPlan = await ChannelPlan.create({
      channel,
      name,
      description,
      price,
      currency,
      durationDays,
    });

    res.status(201).json({ message: "Plan created successfully", plan: newPlan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create plan" });
  }
});

export default router;
