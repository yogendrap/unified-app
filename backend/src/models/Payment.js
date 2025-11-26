// src/models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  channel: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  gateway: { type: String, enum: ["stripe"], default: "stripe" },
  paymentStatus: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  gatewayPaymentId: { type: String },
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
