import mongoose from "mongoose";

export const Roles = ["admin", "managerial", "sales", "member"];
export const Statuses = ["pending_superadmin", "pending_admin", "approved", "rejected"];

const membershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    role: { type: String, enum: Roles, default: "member" },
    status: { type: String, enum: Statuses, default: "pending_admin" },
    requestedAt: { type: Date, default: Date.now },
    decidedAt: { type: Date }
  },
  { timestamps: true }
);

membershipSchema.index({ userId: 1, organizationId: 1 }, { unique: true });

export default mongoose.model("Membership", membershipSchema);
