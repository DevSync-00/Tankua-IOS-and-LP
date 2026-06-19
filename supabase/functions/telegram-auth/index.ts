// @ts-nocheck
// ^^^ This file runs on the Deno runtime inside Supabase Edge Functions.
//     Deno globals (Deno.serve, Deno.env, crypto.subtle) are not available
//     in the local Node.js / Expo TypeScript config, so we suppress local
//     type errors here. The function is fully type-safe at runtime on Deno.
//
// Deploy via the Supabase Dashboard:
//   Edge Functions → telegram-auth → paste this file → Deploy
//
// Required secret (Dashboard → Edge Functions → Manage Secrets):
//   TELEGRAM_BOT_TOKEN = <your full bot token from @BotFather>
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Verify Telegram Login Widget payload
// Spec: https://core.telegram.org/widgets/login#checking-authorization
//
// 1. Remove "hash" from the received fields.
// 2. Sort remaining fields alphabetically and join as "key=value\n" pairs.
// 3. Secret key = SHA-256(bot_token)  [raw bytes, not hex]
// 4. Compute HMAC-SHA-256(data_check_string, secret_key)
// 5. Compare with the received hash (timing-safe).
// ---------------------------------------------------------------------------
async function verifyTelegramHash(
  fields: Record<string, string>,
  botToken: string,
): Promise<boolean> {
  const { hash, ...rest } = fields;
  if (!hash) return false;

  const encoder = new TextEncoder();

  // Secret key: SHA-256 of the bot token
  const secretKeyBytes = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(botToken),
  );

  const hmacKey = await crypto.subtle.importKey(
    "raw",
    secretKeyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  // Data-check-string: sorted key=value pairs, newline-separated
  const checkString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("\n");

  const signature = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    encoder.encode(checkString),
  );

  const computed = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison
  if (computed.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return diff === 0;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken) {
      return json(
        { error: "Server misconfiguration: TELEGRAM_BOT_TOKEN secret is not set" },
        500,
      );
    }

    // ── Parse request body ────────────────────────────────────────────────
    let payload: Record<string, unknown>;
    try {
      payload = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const id        = payload.id        as string | undefined;
    const firstName = payload.first_name as string | undefined;
    const lastName  = payload.last_name  as string | undefined;
    const username  = payload.username   as string | undefined;
    const photoUrl  = payload.photo_url  as string | undefined;
    const authDate  = payload.auth_date  as string | undefined;
    const hash      = payload.hash       as string | undefined;

    if (!id || !firstName || !authDate || !hash) {
      return json({ error: "Missing required Telegram auth fields (id, first_name, auth_date, hash)" }, 400);
    }

    // ── Replay-attack guard (24-hour window) ──────────────────────────────
    const now = Math.floor(Date.now() / 1000);
    const age = now - Number(authDate);
    console.log(`[telegram-auth] auth_date age: ${age}s`);

    if (age > 86400) {
      return json({ error: `Telegram auth data has expired (age: ${age}s)` }, 401);
    }

    // ── Build field map for hash verification ─────────────────────────────
    const fields: Record<string, string> = {
      id:         String(id),
      first_name: String(firstName),
      auth_date:  String(authDate),
      hash:       String(hash),
    };
    if (lastName)  fields.last_name  = String(lastName);
    if (username)  fields.username   = String(username);
    if (photoUrl)  fields.photo_url  = String(photoUrl);

    // Build the check string exactly as Telegram does
    const { hash: _hash, ...rest } = fields;
    const checkString = Object.keys(rest)
      .sort()
      .map((k) => `${k}=${rest[k]}`)
      .join("\n");

    console.log(`[telegram-auth] check_string fields: ${Object.keys(rest).sort().join(", ")}`);
    console.log(`[telegram-auth] check_string: ${checkString.replace(/\n/g, "\\n")}`);
    console.log(`[telegram-auth] received hash: ${hash}`);
    console.log(`[telegram-auth] bot_token first 6 chars: ${botToken.slice(0, 6)}...`);

    const isValid = await verifyTelegramHash(fields, botToken);
    console.log(`[telegram-auth] hash valid: ${isValid}`);

    if (!isValid) {
      return json({
        error: "Invalid Telegram authentication data (hash mismatch)",
        debug: {
          check_string: checkString,
          received_hash: hash,
          token_prefix: botToken.slice(0, 6),
          age_seconds: age,
        },
      }, 401);
    }

    // ── Create/sign-in Supabase user ──────────────────────────────────────
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Use a stable synthetic email derived from the Telegram user ID.
    // We use a portion of the bot token as a pepper so accounts are
    // only usable from this specific bot/deployment.
    const pepper      = botToken.split(":")[0]; // numeric bot ID portion of token
    const tgEmail     = `tg_${id}_${pepper}@tankua.auth.internal`;
    const tgPassword  = `tgpw_${pepper}_${id}`;
    const displayName = [firstName, lastName].filter(Boolean).join(" ");

    // Try sign-in first (fast path for returning users)
    const { data: signInData, error: signInError } =
      await supabaseAdmin.auth.signInWithPassword({
        email: tgEmail,
        password: tgPassword,
      });

    if (!signInError && signInData.session) {
      // Returning user — sync display name / username in case they changed
      await supabaseAdmin
        .from("users")
        .update({
          name:              displayName,
          telegram_username: username ?? null,
          photo_url:         photoUrl  ?? null,
        })
        .eq("telegram_id", String(id));

      console.log(`[telegram-auth] existing user signed in: ${signInData.session.user.id}`);
      return json({ session: signInData.session });
    }

    // New user — create auth account
    const { data: createData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email:          tgEmail,
        password:       tgPassword,
        email_confirm:  true,
        user_metadata: {
          telegram_id: String(id),
          name:        displayName,
          username:    username ?? null,
          photo_url:   photoUrl ?? null,
          provider:    "telegram",
        },
      });

    if (createError || !createData.user) {
      console.error("[telegram-auth] createUser error:", createError?.message);
      return json({ error: createError?.message ?? "Failed to create user" }, 500);
    }

    const userId = createData.user.id;

    // Create the public.users profile row
    const { error: upsertError } = await supabaseAdmin.from("users").upsert(
      {
        id:                userId,
        name:              displayName,
        email:             tgEmail,
        telegram_id:       String(id),
        telegram_username: username ?? null,
        photo_url:         photoUrl ?? null,
        phone_number:      "",
        emergency_contact: "",
        location:          "",
        saved_destinations: [],
        saved_stations:    [],
        is_admin:          false,
      },
      { onConflict: "id" },
    );

    if (upsertError) {
      console.error("[telegram-auth] users upsert error:", upsertError.message);
      // Non-fatal: the auth user exists, session will still work
    }

    // Sign in to get a real session token
    const { data: newSession, error: newSessionError } =
      await supabaseAdmin.auth.signInWithPassword({
        email: tgEmail,
        password: tgPassword,
      });

    if (newSessionError || !newSession.session) {
      console.error("[telegram-auth] post-create sign-in error:", newSessionError?.message);
      return json({ error: "Failed to create session after registration" }, 500);
    }

    console.log(`[telegram-auth] new user created and signed in: ${userId}`);
    return json({ session: newSession.session });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[telegram-auth] unhandled error:", message);
    return json({ error: "Internal server error" }, 500);
  }
});
