import express from "express";
import Stripe from "stripe";
import Payment from "../models/Payment.js";
import ChannelSubscription from "../models/ChannelSubscription.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const stripe = new Stripe("sk_test_51S4fLdSCwGPg7rkpj7I4ZF2RrACP2Tcx9BIxjMe5uVSycQLBGQVt35JrPdYpOPFHVTBFK6eRLfyMX3bll0GE4LDR00D3YXihG3");
// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout Session for Recurring Subscription
 */
router.post("/create-subscription-session", protect, async (req, res) => {
  try {
    const { priceId = 'price_1SSdZTSCwGPg7rkpZTwFbMwv', channel, plan, organizationId } = req.body;

    if (!priceId) {
      return res.status(400).json({ message: "Missing Stripe priceId" });
    }

    // ✅ Make sure priceId is a recurring one
    const price = await stripe.prices.retrieve(priceId);
    if (price.type !== "recurring") {
      return res.status(400).json({
        message: "This price is not recurring. Please use a recurring Stripe priceId.",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: req.user.email,
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
      metadata: {
        userId: req.user._id.toString(),
        organizationId,
        channel,
        plan,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Error creating subscription session:", error.message);
    res.status(500).json({ message: error.message });
  }
});


// 1️⃣ Create Stripe Checkout Session
router.post("/create-session", protect, async (req, res) => {
  try {
    const { amount, channel, plan, organizationId } = req.body;
    const price = amount * 100; // Stripe expects amount in cents

    // Create a Payment record in DB first
    const payment = await Payment.create({
      userId: req.user._id,
      organizationId,
      channel,
      amount,
      currency: "usd",
      gateway: "stripe",
      paymentStatus: "pending",
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `${channel} channel subscription (${plan})` },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription`,
      metadata: {
        paymentId: payment._id.toString(),
        userId: req.user._id.toString(),
        organizationId: organizationId || "",
        channel,
        plan,
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create Stripe session" });
  }
});

// // 2️⃣ Stripe Webhook - verify payment & activate subscription
// router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;
//   // res.status(200).send("Event received");
//   console.log("Webhook received:", req.body);
//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, "whsec_xtj8ZvpM7PaSgLOx0qNGeTIftzzAzlxS");
//   } catch (err) {
//     console.error("❌ Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // ✅ Handle successful payment
//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;
//     const { paymentId, userId, organizationId, channel, plan } = session.metadata;

//     try {
//       const payment = await Payment.findById(paymentId);
//       if (!payment) return res.status(404).json({ message: "Payment not found" });

//       payment.paymentStatus = "success";
//       payment.gatewayPaymentId = session.payment_intent;
//       await payment.save();

//       const duration = plan === "monthly" ? 30 : 365;
//       const endDate = new Date();
//       endDate.setDate(endDate.getDate() + duration);

//       await ChannelSubscription.create({
//         userId,
//         organizationId,
//         channel,
//         plan,
//         status: "active",
//         startDate: new Date(),
//         endDate,
//         paymentId: payment._id,
//       });

//       console.log("✅ Subscription activated for:", channel);
//       res.status(200).send("Success");
//     } catch (error) {
//       console.error("Webhook handling error:", error);
//       res.status(500).send("Server error");
//     }
//   } else {
//     res.status(200).send("Event received");
//   }
// });

// Fetch Stripe session details (GET /api/payments/session/:id)
router.get("/session/:id", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id);

    res.json({
      session_id: session.id,
      amount: session.amount_total,
      currency: session.currency,
      plan: session.metadata?.plan || "N/A",
      channel: session.metadata?.channel || "N/A",
      customer_email: session.customer_details?.email || "",
      status: session.payment_status,
    });
  } catch (err) {
    console.error("Error fetching session:", err.message);
    res.status(500).json({ message: "Could not fetch payment session" });
  }
});

// router.get("/session/:id", async (req, res) => {
//   try {
//     const sessionId = req.params.id;
//     const session = await stripe.checkout.sessions.retrieve(sessionId, {
//       expand: ["payment_intent", "line_items"],
//     });

//     const plan = session.metadata?.plan || "N/A";
//     const channel = session.metadata?.channel || "N/A";
//     const organizationId = session.metadata?.organizationId || null;
//     const userId = session.metadata?.userId || null;
//     const amount = session.amount_total || 0;
//     const currency = session.currency || "usd";
//     const paymentIntentId = session.payment_intent?.id;
//     const status = session.payment_status || "unpaid";

//     // ✅ Store payment details in `Payment` collection (if not already saved)
//     let payment = await Payment.findOne({ gatewayPaymentId: paymentIntentId });
//     if (!payment) {
//       payment = await Payment.create({
//         userId,
//         organizationId,
//         channel,
//         amount: amount / 100,
//         currency,
//         gateway: "stripe",
//         paymentStatus: status === "paid" ? "success" : "pending",
//         gatewayPaymentId: paymentIntentId,
//       });
//     }

//     // ✅ Store subscription details in `ChannelSubscription` collection
//     const existingSub = await ChannelSubscription.findOne({
//       userId,
//       organizationId,
//       channel,
//       plan,
//     });

//     if (!existingSub) {
//       const startDate = new Date();
//       const endDate = new Date();
//       // Basic duration rule based on plan name (you can also store durationDays in metadata)
//       const durationDays = plan.toLowerCase().includes("year") ? 365 : 30;
//       endDate.setDate(endDate.getDate() + durationDays);

//       await ChannelSubscription.create({
//         userId,
//         organizationId,
//         channel,
//         plan,
//         status: status === "paid" ? "active" : "pending",
//         startDate,
//         endDate,
//         paymentId: payment._id,
//       });
//     }

//     // ✅ Send response to frontend
//     res.json({
//       session_id: session.id,
//       amount,
//       currency,
//       plan,
//       channel,
//       organizationId,
//       customer_email: session.customer_details?.email || "",
//       status,
//     });
//   } catch (err) {
//     console.error("❌ Error fetching session:", err.message);
//     res.status(500).json({ message: "Could not fetch or store payment session" });
//   }
// });

router.post("/cancel-subscription", protect, async (req, res) => {
  try {
    const { stripeSubscriptionId } = req.body;
    await stripe.subscriptions.cancel(stripeSubscriptionId);
    await ChannelSubscription.findOneAndUpdate(
      { stripeSubscriptionId },
      { status: "cancelled" }
    );
    res.json({ message: "Subscription cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default router;
