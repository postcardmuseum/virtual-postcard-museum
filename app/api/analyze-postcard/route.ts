import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function extractJson(text: string) {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {}

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {}
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  }

  throw new Error("AI returned an unreadable catalog response.");
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "You must be signed in as curator." },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const curatorEmail = process.env.CURATOR_EMAIL;

    if (!supabaseUrl || !supabaseAnonKey || !curatorEmail) {
      return NextResponse.json(
        { error: "The curator login settings are incomplete." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(
      authorization.slice("Bearer ".length)
    );

    if (userError || !user) {
      return NextResponse.json(
        { error: "Please sign in again as curator." },
        { status: 401 }
      );
    }

    if (
      !user.email ||
      user.email.toLowerCase() !== curatorEmail.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "This account is not authorized to review postcards." },
        { status: 403 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the museum server." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const frontImage = cleanString(body?.frontImage);
    const backImage = cleanString(body?.backImage);

    if (!frontImage) {
      return NextResponse.json(
        { error: "A postcard front image is required." },
        { status: 400 }
      );
    }

    const content: Array<
      | {
          type: "input_text";
          text: string;
        }
      | {
          type: "input_image";
          image_url: string;
          detail: "high";
        }
    > = [
      {
        type: "input_text",
        text: `You are assisting a curator cataloging a vintage postcard.

Study the postcard carefully.

Return ONLY valid JSON, with no markdown or commentary.

Use this exact object shape:

{
  "title": "",
  "country": "",
  "state": "",
  "city": "",
  "landmark": "",
  "postcardDate": "",
  "gallery": "",
  "description": ""
}

Cataloging rules:

- Do not invent facts that are not reasonably supported by the images.

- Prefer a short museum-style title based on visible printed wording or an identifiable subject.

- Read printed captions and other printed information on the front.

- If a back image is provided, inspect it for a postmark location and date, printed caption, publisher, printer, identifying number, and other useful printed catalog information.

- Never read, transcribe, summarize, or interpret the handwritten personal message on the back.

- For postcardDate, prefer a clearly readable postmark date from the back over an estimated date from the front.

- If the postmark is only partly readable, use only what is reasonably supported.

- If the postmark cannot be read reliably, leave postcardDate empty rather than inventing a date.

- A cautious date estimate such as "c. 1940s" may be used only when no readable postmark date is available and the estimate is reasonably supported.

- gallery must be exactly one of:
  "Florida Gallery",
  "California Gallery",
  "Holiday Gallery",
  "Humor Gallery",
  "Grand Gallery",
  "History of Postcards"

- Use Florida Gallery for Florida subjects.

- Use California Gallery for California subjects.

- Use Holiday Gallery for holiday or greeting cards.

- Use Humor Gallery for comic or humorous cards.

- Otherwise use Grand Gallery.

- description should be 1 to 3 concise museum-style sentences describing what is visibly shown.

- Avoid unsupported historical claims.

- If a field is uncertain, return an empty string rather than guessing.`,
      },
      {
        type: "input_image",
        image_url: frontImage,
        detail: "high",
      },
    ];

    if (backImage) {
      content.push({
        type: "input_image",
        image_url: backImage,
        detail: "high",
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "user",
          content,
        },
      ],
    });

    const parsed = extractJson(response.output_text || "");

    const allowedGalleries = new Set([
      "Florida Gallery",
      "California Gallery",
      "Holiday Gallery",
      "Humor Gallery",
      "Grand Gallery",
      "History of Postcards",
    ]);

    const gallery = cleanString(parsed?.gallery);

    return NextResponse.json({
      suggestion: {
        title: cleanString(parsed?.title),
        country: cleanString(parsed?.country),
        state: cleanString(parsed?.state),
        city: cleanString(parsed?.city),
        landmark: cleanString(parsed?.landmark),
        postcardDate: cleanString(parsed?.postcardDate),
        gallery: allowedGalleries.has(gallery) ? gallery : "",
        description: cleanString(parsed?.description),
        backText: "",
      },
    });
  } catch (error) {
    console.error("Postcard AI analysis failed:", error);

    return NextResponse.json(
      { error: "The postcard AI review could not be completed." },
      { status: 500 }
    );
  }
}