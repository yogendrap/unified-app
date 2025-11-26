import mongoose from "mongoose";
import dotenv from "dotenv";
import ChannelPlan from "../models/ChannelPlan.js";

dotenv.config();

const seedPlans = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await ChannelPlan.deleteMany({});
  await ChannelPlan.insertMany([
    {
      channel: "whatsapp",
      name: "Monthly",
      description: "30 days access to WhatsApp channel",
      price: 499,
      currency: "INR",
      durationDays: 30,
    },
    {
      channel: "whatsapp",
      name: "yearly",
      description: "365 days access to WhatsApp channel",
      price: 4999,
      currency: "INR",
      durationDays: 365,
    },
  ]);

  console.log("✅ Channel plans seeded");
  process.exit(0);
};

seedPlans();
