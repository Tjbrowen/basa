import { buffer } from "micro";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import prisma from "@/libs/prismadb";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).send("Missing the stripe signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    if (err instanceof Error) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    } else {
      return res.status(400).send("Webhook error");
    }
  }

  switch (event.type) {
    case "charge.succeeded": {
      const charge: Stripe.Charge = event.data.object as Stripe.Charge;

      if (typeof charge.payment_intent === "string") {
        const address = charge.shipping?.address
          ? {
              city: charge.shipping.address.city || "",
              country: charge.shipping.address.country || "",
              line1: charge.shipping.address.line1 || "",
              line2: charge.shipping.address.line2 || "",
              postal_code: charge.shipping.address.postal_code || "",
              state: charge.shipping.address.state || "",
            }
          : undefined;

        await prisma.order.update({
          where: { paymentIntentId: charge.payment_intent },
          data: { status: "complete", address },
        });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent: Stripe.PaymentIntent = event.data
        .object as Stripe.PaymentIntent;

      await prisma.order.update({
        where: { paymentIntentId: paymentIntent.id },
        data: {
          status: "failed",
          declineReason:
            paymentIntent.last_payment_error?.message || "Payment failed",
        },
      });
      break;
    }

    case "payment_intent.requires_action": {
      const paymentIntent: Stripe.PaymentIntent = event.data
        .object as Stripe.PaymentIntent;

      await prisma.order.update({
        where: { paymentIntentId: paymentIntent.id },
        data: {
          status: "requires_action",
          declineReason: "Further action required",
        },
      });
      break;
    }

    default:
      console.log("Unhandled event type: " + event.type);
  }

  res.json({ received: true });
}
