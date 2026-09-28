import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  // The counter stays off until we explicitly enable it at launch.
  if (process.env.VISITOR_COUNTER_ENABLED !== "true") {
    return NextResponse.json(
      { enabled: false },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Visitor counter settings are incomplete." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const visitorId = body?.visitorId;

  if (typeof visitorId !== "string" || !uuidPattern.test(visitorId)) {
    return NextResponse.json(
      { error: "Invalid visitor ID." },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error: insertError } = await supabase
    .from("museum_visitors")
    .upsert(
      { visitor_id: visitorId },
      { onConflict: "visitor_id", ignoreDuplicates: true }
    );

  if (insertError) {
    console.error("Visitor counter insert error:", insertError);
    return NextResponse.json(
      { error: "Could not update visitor count." },
      { status: 500 }
    );
  }

  const { count, error: countError } = await supabase
    .from("museum_visitors")
    .select("visitor_id", { count: "exact", head: true });

  if (countError) {
    console.error("Visitor counter count error:", countError);
    return NextResponse.json(
      { error: "Could not read visitor count." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { enabled: true, count: count ?? 0 },
    { headers: { "Cache-Control": "no-store" } }
  );
}