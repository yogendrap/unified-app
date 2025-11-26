import express from "express";
import Stripe from "stripe";
import ChannelSubscription from "../models/ChannelSubscription.js";
import Payment from "../models/Payment.js";

const router = express.Router();
const stripe = new Stripe("sk_test_51S4fLdSCwGPg7rkpj7I4ZF2RrACP2Tcx9BIxjMe5uVSycQLBGQVt35JrPdYpOPFHVTBFK6eRLfyMX3bll0GE4LDR00D3YXihG3");

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, "whsec_xtj8ZvpM7PaSgLOx0qNGeTIftzzAzlxS");
  } catch (err) {
    console.error("❌ Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { userId, organizationId, channel, plan } = session.metadata;

      const stripeSubscriptionId = session.subscription;

      await ChannelSubscription.create({
        userId,
        organizationId,
        channel,
        plan : plan.toLowerCase(),
        stripeSubscriptionId,
        status: "active",
        startDate: new Date(),
      });

      console.log("✅ New subscription started:", stripeSubscriptionId);
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object;
      const subId = invoice.subscription;

      const subscription = await stripe.subscriptions.retrieve(subId);
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

      await ChannelSubscription.findOneAndUpdate(
        { stripeSubscriptionId: subId },
        { endDate: currentPeriodEnd, status: "active" }
      );

      console.log("✅ Subscription renewed:", subId);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const subId = invoice.subscription;

      await ChannelSubscription.findOneAndUpdate(
        { stripeSubscriptionId: subId },
        { status: "payment_failed" }
      );

      console.log("⚠️ Payment failed for subscription:", subId);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await ChannelSubscription.findOneAndUpdate(
        { stripeSubscriptionId: sub.id },
        { status: "cancelled" }
      );
      console.log("❌ Subscription cancelled:", sub.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).send("Webhook received");
});

export default router;


// https://app.hubspot.com/oauth/authorize?client_id=82fa0a47-4bab-47be-b5e0-cd4f19747e1e&redirect_uri=https%3A%2F%2Fvira.niswey.net%2Fhubspot%2Fauth&scope=files%20timeline%20automation%20forms%20crm.lists.read%20crm.lists.write%20crm.objects.deals.read%20crm.schemas.deals.read%20crm.schemas.contacts.write%20crm.objects.contacts.write%20crm.schemas.contacts.read%20crm.objects.contacts.read