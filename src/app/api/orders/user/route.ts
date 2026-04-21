import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const email = new URL(request.url).searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email em falta" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Pesquisa case-insensitive por email
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total, created_at, items, tracking_code, payment_status, payment_method")
    .ilike("customer_email", email.trim())
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data ?? [] });
}
