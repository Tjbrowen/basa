import Stripe from "stripe";
import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";
import { CartProductType } from "@/app/product/[productId]/ProductDetails";
import { getCurrentUser } from "@/actions/getCurrentUser";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10",
});

const calculateOrderAmount = (items: CartProductType[]) => {
  const totalPrice = items.reduce((acc, item) => {
    const itemTotal = item.price * item.quantity;
    return acc + itemTotal;
  }, 0);

  return Math.round(totalPrice * 100); // Convert to cents and round to ensure it's an integer
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        console.error("Unauthorized request");
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { items, payment_intent_id } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        console.error("Invalid items array");
        return res.status(400).json({ error: "Invalid items array" });
      }

      // Calculate total amount in cents
      const total = calculateOrderAmount(items);
      console.log(`Total amount calculated: ${total} cents`);

      // Prepare order data
      const orderData = {
        userId: currentUser.id,
        amount: total,
        currency: "zar",
        status: "pending",
        deliveryStatus: "pending",
        paymentIntentId: payment_intent_id,
        createDate: new Date(),
      };

      const productsData = items.map((item) => ({
        name: item.name,
        description: item.description,
        category: item.category,
        brand: item.brand,
        selectedImg: {
          color: item.selectedImg.color,
          colorCode: item.selectedImg.colorCode,
          image: item.selectedImg.image,
        },
        quantity: item.quantity,
        price: item.price,
      }));

      let paymentIntent;

      // If there's an existing payment intent, retrieve and possibly cancel it
      if (payment_intent_id) {
        paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

        // If the existing payment intent is incomplete, cancel it
        if (paymentIntent.status === "requires_payment_method") {
          await stripe.paymentIntents.cancel(payment_intent_id);
        }
      }

      // Create a new payment intent
      paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: "zar",
        automatic_payment_methods: { enabled: true },
      });

      orderData.paymentIntentId = paymentIntent.id;

      // Create or update the order in the database
      if (payment_intent_id) {
        await prisma.order.update({
          where: { paymentIntentId: payment_intent_id },
          data: {
            amount: total,
            products: {
              deleteMany: {}, // clear existing products
              create: productsData,
            },
          },
        });
      } else {
        await prisma.order.create({
          data: {
            ...orderData,
            products: {
              create: productsData,
            },
          },
        });
      }

      console.log(`Payment intent processed successfully: ${paymentIntent.id}`);
      return res.status(200).json({ paymentIntent });
    } catch (error) {
      console.error("Error processing order:", error);
      return res.status(500).json({ error: "Error processing order" });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
