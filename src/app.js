import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import orgRoutes from "./routes/orgRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import inviteRoutes from "./routes/inviteRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import orgAdminRoutes from "./routes/orgAdminRoutes.js";
import channelRoutes from "./routes/channelRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import stripeWebhook from "./routes/stripeWebhook.js";
import Payment from "./routes/payments.js";


dotenv.config();
const app = express();
app.use("/api/payments/webhook", stripeWebhook);
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Express + MongoDB server running 🚀");
});

// app.get("/api/ping", (req, res) => {
//   res.json({ message: "pong 🏓" });
// });
app.use("/api/auth", authRoutes);
app.use("/api/orgs", orgRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/org-admin", orgAdminRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/payment", Payment);
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
