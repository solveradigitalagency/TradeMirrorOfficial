
import Stripe from "stripe";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key);
};

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe webhook signature or secret." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook signature." }, {
      status: 400,
    });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseSecret) {
      throw new Error("Missing Supabase server environment variables.");
    }

    const supabase = createSupabaseAdmin(supabaseUrl, supabaseSecret, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const updatePlan = async (
      userId: string,
      plan: "free" | "pro",
      customerId?: string | null,
      subscriptionId?: string | null
    ) => {
      const { error } = await supabase
        .from("profiles")
        .update({ plan, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;

      console.log(`Updated TradeMirror profile plan to ${plan}.`, {
        userId,
        customerId,
        subscriptionId,
      });
    };

    const stripe = getStripe();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === "subscription" && session.subscription) {
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;

        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );

        const userId =
          subscription.metadata.supabase_user_id ||
          session.metadata?.supabase_user_id ||
          session.client_reference_id;

        if (userId) {
          const isPro =
            subscription.status === "active" ||
            subscription.status === "trialing";

          await updatePlan(
            userId,
            isPro ? "pro" : "free",
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id,
            subscription.id
          );
        } else {
          console.error("Checkout session has no Supabase user ID.");
        }
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata.supabase_user_id;

      if (userId) {
        const isPro =
          event.type !== "customer.subscription.deleted" &&
          (subscription.status === "active" ||
            subscription.status === "trialing");

        await updatePlan(
          userId,
          isPro ? "pro" : "free",
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id,
          subscription.id
        );
      } else {
        console.error("Subscription has no Supabase user ID metadata.");
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
