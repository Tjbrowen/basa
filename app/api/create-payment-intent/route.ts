import Stripe from "stripe";
import prisma from "@/libs/prismadb";
import { NextResponse } from "next/server";
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

  return totalPrice * 100; // Amount in cents
};

export async function POST(request: Request) {
  try {
    // Ensure user is authenticated
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, payment_intent_id } = body;

    // Calculate total amount in cents
    const total = calculateOrderAmount(items);

    // Prepare order data
    const orderData = {
      user: { connect: { id: currentUser.id } },
      amount: total,
      currency: "zar",
      status: "pending",
      deliveryStatus: "pending",
      products: { set: items.map((item: any) => ({ ...item })) },
      createDate: new Date(),
      paymentIntentId: payment_intent_id,
    };

    // Process payment intent
    if (payment_intent_id) {
      // Retrieve current payment intent from Stripe
      const current_intent = await stripe.paymentIntents.retrieve(
        payment_intent_id
      );

      if (!current_intent) {
        return NextResponse.json(
          { error: "Invalid Payment Intent" },
          { status: 400 }
        );
      }

      // Update payment intent amount if necessary
      const updated_intent = await stripe.paymentIntents.update(
        payment_intent_id,
        { amount: total }
      );

      // Update corresponding order in database
      await prisma.order.update({
        where: { paymentIntentId: payment_intent_id },
        data: {
          amount: total,
          products: { set: items.map((item: any) => ({ ...item })) },
        },
      });

      return NextResponse.json({ paymentIntent: updated_intent });
    } else {
      // Create new payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: "zar",
        payment_method_types: ["card"],
      });

      // Update order data with new paymentIntentId
      orderData.paymentIntentId = paymentIntent.id;

      // Create new order in database
      await prisma.order.create({
        data: {
          user: orderData.user,
          amount: orderData.amount,
          currency: orderData.currency,
          status: orderData.status,
          deliveryStatus: orderData.deliveryStatus,
          products: orderData.products,
          createDate: orderData.createDate,
          paymentIntentId: orderData.paymentIntentId,
        },
      });

      return NextResponse.json({ paymentIntent });
    }
  } catch (error) {
    console.error("Error processing order:", error);
    return NextResponse.json(
      { error: "Error processing order" },
      { status: 500 }
    );
  }
}
