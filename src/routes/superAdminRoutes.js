import express from "express";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import Membership from "../models/Membership.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";

const router = express.Router();

// list pending_superadmin
router.get("/pending", protect, requireAdmin, async (req, res) => {
  const items = await Membership.find({ status: "pending_superadmin" })
    .populate("userId", "email name isActive")
    .populate("organizationId", "name domain isActive");
  res.json(items);
});

// approve first admin
router.post("/approve/:membershipId", protect, requireAdmin, async (req, res) => {
  const m = await Membership.findById(req.params.membershipId);
  if (!m || m.status !== "pending_superadmin") {
    return res.status(400).json({ message: "Invalid membership" });
  }

  const user = await User.findById(m.userId);
  const org = await Organization.findById(m.organizationId);

  m.status = "approved";
  m.decidedAt = new Date();
  await m.save();

//   if (!user.organizations.some((o) => o.toString() === org._id.toString())) {
//     user.organizations.push(org._id);
//   }
  user.isActive = true; // can login now
  await user.save();

  org.isActive = true;
//   if (!org.members.some((u) => u.toString() === user._id.toString())) {
//     org.members.push(user._id);
//   }
  await org.save();

  res.json({ message: "Organization activated and first admin approved" });
});

// reject
router.post("/reject/:membershipId", protect, requireAdmin, async (req, res) => {
  const m = await Membership.findById(req.params.membershipId);
  if (!m || m.status !== "pending_superadmin") {
    return res.status(400).json({ message: "Invalid membership" });
  }
  m.status = "rejected";
  m.decidedAt = new Date();
  await m.save();
  res.json({ message: "Rejected" });
});

export default router;
