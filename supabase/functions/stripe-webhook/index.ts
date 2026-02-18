import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
      apiVersion: '2023-10-16',
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    )

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log(`Processing Stripe event: ${event.type}`)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const { game_session_id, player_name } = session.metadata || {}

      if (!game_session_id || !player_name) {
        console.error('Missing metadata in session:', session.id)
        return new Response(JSON.stringify({ error: 'Missing metadata' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        })
      }

      // Débloquer le premium dans game_sessions
      const { error: updateError } = await supabase
        .from('game_sessions')
        .update({
          premium_unlocked: true,
          premium_unlocked_by: player_name,
          premium_unlocked_at: new Date().toISOString(),
          stripe_payment_id: session.payment_intent as string,
        })
        .eq('id', game_session_id)

      if (updateError) {
        console.error('Error updating game_session:', updateError.message)
        throw new Error(`Failed to update game session: ${updateError.message}`)
      }

      // Enregistrer le paiement dans la table payments
      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          session_id: game_session_id,
          player_name: player_name,
          amount: session.amount_total || 399,
          currency: session.currency || 'eur',
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_session_id: session.id,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Error inserting payment:', insertError.message)
        // On ne throw pas ici — le premium est déjà débloqué, l'enregistrement du paiement est secondaire
      }

      console.log(`✅ Premium unlocked for session ${game_session_id} by ${player_name}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
