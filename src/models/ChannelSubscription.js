// src/models/ChannelSubscription.js
import mongoose from "mongoose";

const channelSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  channel: { type: String, enum: ["whatsapp", "telegram"], required: true },
  plan: { type: String, enum: ["monthly", "yearly"], required: true },
  stripeSubscriptionId: { type: String },
  status: {
    type: String,
    enum: ["active", "cancelled", "payment_failed"],
    default: "active",
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
}, { timestamps: true });

export default mongoose.model("ChannelSubscription", channelSubscriptionSchema);