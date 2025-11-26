import express from "express";
import Membership from "../models/Membership.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// get pending memberships (paginated optional)
router.get("/memberships/pending", protect, requireAdmin, async (req, res) => {
  const pending = await Membership.find({ status: "pending" })
    .populate("userId", "name email")
    .populate("organizationId", "name domain")
    .sort({ requestedAt: -1 })
    .limit(100);
  res.json({ pending });
});

// approve membership
router.post("/memberships/:id/approve", protect, requireAdmin, async (req, res) => {
  ///const session = await mongoose.startSession();
 // session.startTransaction();
  try {
    const membership = await Membership.findById(req.params.id)
    if (!membership) return res.status(404).json({ message: "Membership not found" });
    if (membership.status !== "pending") return res.status(400).json({ message: "Already processed" });
    console.log("Approving membership:", membership);
    // update membership
    membership.status = "approved";
    membership.decidedAt = new Date();
    await membership.save();
    console.log("Membership approved:", membership);
    // add org -> user relationship
    // const [user, org] = await Promise.all([
    //   User.findById(membership.userId).session(session),
    //   Organization.findById(membership.organizationId).session(session),
    // ]);

    // if (!user || !org) {
    //  // await session.abortTransaction();
    //   return res.status(400).json({ message: "User or Organization missing" });
    // }

    // ensure user.organizations and org.members are updated (avoid duplicates)
    // if (!user.organizations?.some((o) => o.toString() === org._id.toString())) {
    //   user.organizations = user.organizations || [];
    //   user.organizations.push(org._id);
    //   await user.save({ });
    // }
    // if (!org.members?.some((m) => m.toString() === user._id.toString())) {
    //   org.members = org.members || [];
    //   org.members.push(user._id);
    //   await org.save({ });
    // }

    //await session.commitTransaction();
    //session.endSession();
    res.json({ message: "Membership approved", membershipId: membership._id });
  } catch (err) {
   // await session.abortTransaction();
    //session.endSession();
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// reject membership
router.post("/memberships/:id/reject", protect, requireAdmin, async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) return res.status(404).json({ message: "Membership not found" });
    if (membership.status !== "pending") return res.status(400).json({ message: "Already processed" });
    membership.status = "rejected";
    membership.decidedAt = new Date();
    await membership.save();
    res.json({ message: "Membership rejected", membershipId: membership._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
