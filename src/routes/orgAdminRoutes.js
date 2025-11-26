import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Membership, { Roles } from "../models/Membership.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";

// helper: check if req.user is admin of given org
async function isOrgAdmin(userId, orgId) {
  const m = await Membership.findOne({
    userId,
    organizationId: orgId,
    role: "admin",
    status: "approved",
  });
  return !!m;
}

const router = express.Router();

// list pending_admin for orgs current user admins
router.get("/pending/:orgId", protect, async (req, res) => {
  const { orgId } = req.params;
  if (!(await isOrgAdmin(req.user._id, orgId))) {
    return res.status(403).json({ message: "Org admin only" });
  }
  const items = await Membership.find({ organizationId: orgId, status: "pending_admin" })
    .populate("userId", "email name isActive")
    .populate("organizationId", "name domain");
  res.json(items);
});

// approve + assign role
router.post("/approve/:membershipId", protect, async (req, res) => {
  const { role = "member" } = req.body;
  const m = await Membership.findById(req.params.membershipId);
  if (!m || m.status !== "pending_admin") return res.status(400).json({ message: "Invalid request" });

  if (!(await isOrgAdmin(req.user._id, m.organizationId))) {
    return res.status(403).json({ message: "Org admin only" });
  }
  if (!Roles.includes(role)) return res.status(400).json({ message: "Invalid role" });

  const user = await User.findById(m.userId);
  const org = await Organization.findById(m.organizationId);

  m.status = "approved";
  m.role = role;
  m.decidedAt = new Date();
  await m.save();

  user.isActive = true; // becomes active on first approval
//   if (!user.organizations.some((o) => o.toString() === org._id.toString())) {
//     user.organizations.push(org._id);
//   }
  await user.save();

//   if (!org.members.some((u) => u.toString() === user._id.toString())) {
//     org.members.push(user._id);
//   }
  //await org.save();

  res.json({ message: "Member approved and role assigned" });
});

// reject
router.post("/reject/:membershipId", protect, async (req, res) => {
  const m = await Membership.findById(req.params.membershipId);
  if (!m || m.status !== "pending_admin") return res.status(400).json({ message: "Invalid request" });

  if (!(await isOrgAdmin(req.user._id, m.organizationId))) {
    return res.status(403).json({ message: "Org admin only" });
  }
  m.status = "rejected";
  m.decidedAt = new Date();
  await m.save();
  res.json({ message: "Rejected" });
});

router.get("/check", protect, async (req, res) => {
  try {
    const { userId, orgId } = req.query;

    if (!userId || !orgId) {
      return res.status(400).json({ message: "userId and orgId are required" });
    }

    const membership = await Membership.findOne({
      userId,
      organizationId: orgId
    });

    if (!membership) {
      return res.json({
        isMember: false,
        isAdmin: false,
        role: null,
        status: "none"
      });
    }

    return res.json({
      isMember: membership.status === "approved",
      isAdmin: membership.role === "admin" && membership.status === "approved",
      role: membership.role,
      status: membership.status
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
