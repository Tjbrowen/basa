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

  return Math.round(totalPrice * 100); // Convert to cents and round to ensure it's an integer
};

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error("Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, payment_intent_id } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("Invalid items array");
      return NextResponse.json(
        { error: "Invalid items array" },
        { status: 400 }
      );
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

    if (payment_intent_id) {
      console.log(`Updating payment intent: ${payment_intent_id}`);
      const current_intent = await stripe.paymentIntents.retrieve(
        payment_intent_id
      );
      if (!current_intent) {
        console.error("Invalid Payment Intent");
        return NextResponse.json(
          { error: "Invalid Payment Intent" },
          { status: 400 }
        );
      }

      const updated_intent = await stripe.paymentIntents.update(
        payment_intent_id,
        {
          amount: total,
        }
      );

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

      console.log(`Payment intent updated successfully: ${updated_intent.id}`);
      return NextResponse.json({ paymentIntent: updated_intent });
    } else {
      console.log("Creating new payment intent");
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: "zar",
        automatic_payment_methods: { enabled: true },
      });

      orderData.paymentIntentId = paymentIntent.id;

      await prisma.order.create({
        data: {
          ...orderData,
          products: {
            create: productsData,
          },
        },
      });

      console.log(`Payment intent created successfully: ${paymentIntent.id}`);
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
