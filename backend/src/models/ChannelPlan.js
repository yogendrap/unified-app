import mongoose from "mongoose";

const channelPlanSchema = new mongoose.Schema(
  {
    channel: {
      type: String,
      enum: ["whatsapp", "telegram", "email"],
      required: true,
    },
    name: { type: String, required: true }, // e.g. "Monthly", "Yearly"
    description: { type: String },
    price: { type: Number, required: true }, // e.g. 499
    currency: { type: String, default: "USD" },
    durationDays: { type: Number, required: true }, // e.g. 30 or 365
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("ChannelPlan", channelPlanSchema);
