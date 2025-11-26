import express from "express";
import { Roles } from "../models/Membership.js";
import Membership from "../models/Membership.js";
import { protect } from "../middleware/authMiddleware.js";
import Organization from "../models/Organization.js";
import { checkOrgAdmin } from "../middleware/checkOrgAdmin.js";

const router = express.Router();

router.get("/me", protect, async (req, res) => {
  const memberships = await Membership.find({ userId: req.user._id })
    .populate("organizationId", "name domain")
    .sort({ requestedAt: -1 });
    console.log("Memberships:", memberships);
  res.json({ memberships });
});

router.get("/me/orgs", protect, async (req, res) => {
  try {
    const orgs = await Membership.find({
      userId: req.user._id,
      status: "approved",
    })
      .populate("organizationId", "name domain")
      .select("organizationId");

    res.json({
      organizations: orgs.map((m) => ({
        id: m.organizationId._id,
        name: m.organizationId.name,
        domain: m.organizationId.domain,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/roles", protect, async (_req, res) => {
  res.json({ roles: Roles });
});

router.get("/:id/members", protect, checkOrgAdmin , async (req, res) => {
  const orgId = req.params.id;
  console.log("Fetching members for orgId:", orgId);
  const orgs = await Membership.find({
      organizationId: orgId,
      status: "approved",
    })
    .populate("userId", "name email")

  console.log("Org members found:", orgs);
  if (!orgs) return res.status(404).json({ message: "Org not found" });

  res.json({
    members: orgs.map(m => ({
      _id: m.userId._id,
      name: m.userId.name,
      email: m.userId.email,
      role: m.role
    }))
  });
});

router.post("/:orgId/kick/:userId", protect, checkOrgAdmin, async (req, res) => {
  const { orgId, userId } = req.params;

  try {
    // Check membership of the requester (admin check)
    const requesterMembership = await Membership.findOne({
      organizationId: orgId,
      userId: req.user._id,
      status: "approved",
    });

    if (!requesterMembership || requesterMembership.role !== "admin") {
      return res.status(403).json({ message: "Only admin can remove members." });
    }

    // Admin cannot kick themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot remove yourself. Use leave instead.",
      });
    }

    // Check if the target is an admin
    const targetMembership = await Membership.findOne({
      organizationId: orgId,
      userId,
      status: "approved",
    });

    if (!targetMembership) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Prevent removing the last admin
    if (targetMembership.role === "admin") {
      const adminCount = await Membership.countDocuments({
        organizationId: orgId,
        role: "admin",
        status: "approved",
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Cannot remove the last admin.",
        });
      }
    }

    // DELETE membership
    await Membership.findOneAndDelete({
      organizationId: orgId,
      userId,
    });

    res.json({ message: "Member removed successfully" });

  } catch (err) {
    console.error("Kick error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



export default router;
