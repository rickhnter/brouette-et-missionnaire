import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Web Push crypto utilities
async function generatePushHeaders(
  endpoint: string,
  vapidSubject: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
) {
  const urlObj = new URL(endpoint);
  const audience = `${urlObj.protocol}//${urlObj.host}`;

  // Create JWT for VAPID
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 3600,
    sub: vapidSubject,
  };

  const encoder = new TextEncoder();
  const b64url = (buf: ArrayBuffer) => {
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const headerB64 = btoa(JSON.stringify(header))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const payloadB64 = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const rawPrivate = Uint8Array.from(
    atob(vapidPrivateKey.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0)
  );

  const key = await crypto.subtle.importKey(
    "pkcs8",
    rawPrivate.buffer.byteLength === 32 ? await wrapRawToP256(rawPrivate) : rawPrivate,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    encoder.encode(unsignedToken)
  );

  // Convert DER signature to raw r||s if needed
  const sigBytes = new Uint8Array(signature);
  let rawSig: Uint8Array;
  if (sigBytes[0] === 0x30) {
    // DER encoded
    rawSig = derToRaw(sigBytes);
  } else {
    rawSig = sigBytes;
  }

  const jwt = `${unsignedToken}.${b64url(rawSig.buffer)}`;

  // Decode public key for Authorization header
  const pubKeyB64 = vapidPublicKey.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (pubKeyB64.length % 4)) % 4);
  
  return {
    Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
    "Content-Type": "application/json",
    TTL: "86400",
  };
}

function derToRaw(der: Uint8Array): Uint8Array {
  // Parse DER SEQUENCE of two INTEGERs
  let offset = 2; // skip SEQUENCE tag and length
  const raw = new Uint8Array(64);
  
  // R value
  const rLen = der[offset + 1];
  offset += 2;
  const rStart = rLen > 32 ? offset + (rLen - 32) : offset;
  const rDest = rLen < 32 ? 32 - rLen : 0;
  raw.set(der.slice(rStart, offset + rLen), rDest);
  offset += rLen;
  
  // S value
  const sLen = der[offset + 1];
  offset += 2;
  const sStart = sLen > 32 ? offset + (sLen - 32) : offset;
  const sDest = sLen < 32 ? 32 + (32 - sLen) : 32;
  raw.set(der.slice(sStart, offset + sLen), sDest);
  
  return raw;
}

async function wrapRawToP256(raw: Uint8Array): Promise<ArrayBuffer> {
  // Wrap a 32-byte raw private key into PKCS8 format for P-256
  const pkcs8Header = new Uint8Array([
    0x30, 0x81, 0x87, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86,
    0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d,
    0x03, 0x01, 0x07, 0x04, 0x6d, 0x30, 0x6b, 0x02, 0x01, 0x01, 0x04, 0x20,
  ]);
  const pkcs8Footer = new Uint8Array([
    0xa1, 0x44, 0x03, 0x42, 0x00,
  ]);
  // We don't include the public key point since we only need signing
  const result = new Uint8Array(pkcs8Header.length + 32);
  result.set(pkcs8Header);
  result.set(raw, pkcs8Header.length);
  return result.buffer;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // GET: return VAPID public key
    if (req.method === "GET") {
      const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") || "";
      return new Response(
        JSON.stringify({ publicKey: vapidPublicKey }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { session_id, player_name, title, body } = await req.json();

    if (!session_id || !player_name || !title) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const vapidSubject = Deno.env.get("VAPID_SUBJECT")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get partner's subscription (not the sender's)
    const { data: session } = await supabase
      .from("game_sessions")
      .select("player1_name, player2_name")
      .eq("id", session_id)
      .single();

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const partnerName =
      session.player1_name === player_name
        ? session.player2_name
        : session.player1_name;

    if (!partnerName) {
      return new Response(
        JSON.stringify({ error: "No partner found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: sub } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("session_id", session_id)
      .eq("player_name", partnerName)
      .single();

    if (!sub?.subscription) {
      return new Response(
        JSON.stringify({ ok: false, reason: "No subscription for partner" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subscription = sub.subscription as { endpoint: string; keys: { p256dh: string; auth: string } };

    // Send push via fetch to the push endpoint
    const pushPayload = JSON.stringify({ title, body, icon: "/favicon.ico" });
    
    const headers = await generatePushHeaders(
      subscription.endpoint,
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    const pushResponse = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        ...headers,
      },
      body: pushPayload,
    });

    if (!pushResponse.ok) {
      const errorText = await pushResponse.text();
      console.error("Push failed:", pushResponse.status, errorText);
      
      // If subscription expired, clean it up
      if (pushResponse.status === 404 || pushResponse.status === 410) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("session_id", session_id)
          .eq("player_name", partnerName);
      }

      return new Response(
        JSON.stringify({ ok: false, reason: "Push delivery failed", status: pushResponse.status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
