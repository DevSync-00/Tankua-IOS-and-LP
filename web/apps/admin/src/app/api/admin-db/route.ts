import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const cleanEnvValue = (value?: string) => value?.trim().replace(/^["']|["']$/g, "");

const supabaseUrl = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const serviceRoleKey = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);

const allowedTables = new Set([
  "admin_users",
  "audit_logs",
  "bookings",
  "destinations",
  "notifications",
  "payment_transactions",
  "payouts",
  "promotions",
  "providers",
  "provider_users",
  "refunds",
  "reviews",
  "route_suggestions",
  "settings",
  "support_tickets",
  "ticket_messages",
  "trips",
  "users",
  "vehicles",
  "drivers",
  "pickup_stations",
  "trip_pickup_stations",
]);

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY for admin privileges.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function requireAdmin(supabase: SupabaseClient, request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return { error: "Missing admin session.", status: 401 };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user?.email) {
    return { error: "Invalid admin session.", status: 401 };
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id, email, role, is_active")
    .eq("email", user.email.toLowerCase())
    .eq("is_active", true)
    .maybeSingle();

  if (adminError || !admin) {
    return { error: "Active admin account required.", status: 403 };
  }

  return { admin };
}

function applyFilters(query: any, filters: any[] = []) {
  return filters.reduce((current, filter) => {
    const op = filter.op || "eq";
    if (op === "in") return current.in(filter.column, filter.value);
    if (op === "neq") return current.neq(filter.column, filter.value);
    if (op === "lt") return current.lt(filter.column, filter.value);
    if (op === "lte") return current.lte(filter.column, filter.value);
    if (op === "gt") return current.gt(filter.column, filter.value);
    if (op === "gte") return current.gte(filter.column, filter.value);
    if (op === "ilike") return current.ilike(filter.column, filter.value);
    return current.eq(filter.column, filter.value);
  }, query);
}

async function findAuthUserByEmail(supabase: SupabaseClient, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  let page = 1;

  while (page < 20) {
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });

    if (error) throw error;

    const match = users.find((user) => user.email?.toLowerCase() === normalizedEmail);
    if (match) return match;
    if (users.length < 1000) return null;
    page += 1;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const supabase = getAdminClient();
    const auth = await requireAdmin(supabase, request);

    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const table = String(body.table || "");
    const action = String(body.action || "");

    if (!allowedTables.has(table) && !action.startsWith("auth")) {
      return NextResponse.json({ error: "Table is not allowed for admin API." }, { status: 400 });
    }

    if (action === "authCreateUser") {
      const { email, password, email_confirm = true } = body.values || {};
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email: String(email).trim().toLowerCase(),
        password,
        email_confirm,
      });

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ data });
    }

    if (action === "authUpdatePasswordByEmail") {
      const { email, password } = body.values || {};
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
      }

      const authUser = await findAuthUserByEmail(supabase, email);
      if (!authUser) {
        return NextResponse.json({ error: "Auth user not found." }, { status: 404 });
      }

      const { data, error } = await supabase.auth.admin.updateUserById(authUser.id, { password });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ data });
    }

    let query: any;
    const select = body.select || "*";

    if (action === "select") {
      query = supabase.from(table).select(select, { count: body.count ? "exact" : undefined });
      query = applyFilters(query, body.filters);
      if (body.order?.column) query = query.order(body.order.column, { ascending: body.order.ascending !== false });
      if (body.limit) query = query.limit(body.limit);
      if (body.offset !== undefined) query = query.range(body.offset, body.offset + (body.limit || 10) - 1);
      if (body.single) query = query.single();
      if (body.maybeSingle) query = query.maybeSingle();
    } else if (action === "insert") {
      query = supabase.from(table).insert(body.values).select(select);
      if (body.single) query = query.single();
    } else if (action === "update") {
      query = supabase.from(table).update(body.values).select(select);
      query = applyFilters(query, body.filters);
      if (body.single) query = query.single();
      if (body.maybeSingle) query = query.maybeSingle();
    } else if (action === "delete") {
      query = supabase.from(table).delete().select(select);
      query = applyFilters(query, body.filters);
    } else {
      return NextResponse.json({ error: "Unsupported admin action." }, { status: 400 });
    }

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ data, count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Admin API failed." }, { status: 500 });
  }
}
