import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };

  try {
    const origin = request.headers.get("origin");

    if (!origin || origin !== request.nextUrl.origin) {
      return NextResponse.json(
        { error: "Please sign up through the museum website." },
        { status: 403, headers }
      );
    }

    const rawBody = await request.text();

    if (rawBody.length > 4096) {
      return NextResponse.json(
        { error: "The signup information is too long." },
        { status: 413, headers }
      );
    }

    let body;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid signup information." },
        { status: 400, headers }
      );
    }

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      body?.consent !== true
    ) {
      return NextResponse.json(
        {
          error:
            "Enter a valid email and agree to receive museum updates.",
        },
        { status: 400, headers }
      );
    }

    // Hidden form field to discourage automated spam.
    if (body?.website) {
      return NextResponse.json({ success: true }, { headers });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return NextResponse.json(
        { error: "Museum signup is temporarily unavailable." },
        { status: 503, headers }
      );
    }

    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { error } = await supabase
      .from("museum_subscribers")
      .insert({
        email,
        consent_given: true,
      });

    // An existing signup receives the same confirmation.
    if (error && error.code !== "23505") {
      console.error("Museum signup failed:", error.code);

      return NextResponse.json(
        { error: "Could not save your signup. Please try again." },
        { status: 500, headers }
      );
    }

    return NextResponse.json({ success: true }, { headers });
  } catch {
    return NextResponse.json(
      { error: "Could not save your signup. Please try again." },
      { status: 500, headers }
    );
  }
}