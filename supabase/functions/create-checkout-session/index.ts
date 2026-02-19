import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
      apiVersion: "2023-10-16",
    });

    const { roomId, playerName } = await req.json();

    if (!roomId || !playerName) {
      return new Response(JSON.stringify({ error: "roomId and playerName are required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Determine origin for redirect URLs
    const origin = req.headers.get("origin") || "https://brouette-et-missionnaire.lovable.app";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Brouette & Missionnaire — Premium",
              description: "100+ questions supplémentaires (niveaux 3, 4 et 5) pour approfondir votre relation",
              images: [],
            },
            unit_amount: 399, // 3,99€ en centimes
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/?premium=success`,
      cancel_url: `${origin}/?premium=cancelled`,
      metadata: {
        game_session_id: roomId,
        player_name: playerName,
      },
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
