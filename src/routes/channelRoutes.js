// routes/channelRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authMiddleware.js";
import ChannelSubscription from "../models/ChannelSubscription.js";

const router = express.Router();

 router.post("/whatsapp/token", protect, async (req, res) => {
 const { orgId } = req.body;

  const activeSub = await ChannelSubscription.findOne({
    organizationId: orgId,
    channel: "whatsapp",
    status: "active",
  });

  console.log("Active Subscription:", activeSub);

  if (!activeSub) {
    return res.status(403).json({
      message: "Subscription required to access WhatsApp channel",
    });
  }
  const userId = req.user._id;
  //const orgId = req.body.orgId || null;
  const payload = { userId, orgId, channel: "whatsapp" };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

router.post("/whatsapp/token/refresh", protect, (req, res) => {
  const payload = { userId: req.user._id, orgId: req.body.orgId, channel: "whatsapp" };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
  res.json({ token });
});

export default router;
