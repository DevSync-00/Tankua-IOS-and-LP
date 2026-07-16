import { supabase } from "./supabase";

type AdminDbPayload = {
  table: string;
  action: "select" | "insert" | "update" | "delete" | "authCreateUser" | "authUpdatePasswordByEmail";
  select?: string;
  values?: any;
  filters?: Array<{
    column: string;
    op?: "eq" | "neq" | "in" | "lt" | "lte" | "gt" | "gte" | "ilike";
    value: any;
  }>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  single?: boolean;
  maybeSingle?: boolean;
  count?: boolean;
};

export async function adminDbRequest<T = any>(payload: AdminDbPayload): Promise<{ data: T; count?: number }> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error("Admin session expired. Please sign in again.");
  }

  const response = await fetch("/api/admin-db", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || "Admin request failed.");
  }

  return { data: result.data as T, count: result.count };
}
