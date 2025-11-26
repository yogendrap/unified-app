import Membership from "../models/Membership.js";

export const checkOrgAdmin = async (req, res, next) => {
  try {
    const orgId = req.params.orgId || req.params.id;
    const userId = req.user._id;
console.log("Checking admin for userId:", userId, "in orgId:", orgId);
    const membership = await Membership.findOne({
      organizationId: orgId,
      userId: userId,
      status: "approved",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organization",
      });
    }

    if (membership.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can access this resource",
      });
    }

    next(); // 🔥 continue to next handler
  } catch (err) {
    console.error("Admin Check Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
