import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE = 30 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;
    const curatorEmail = process.env.CURATOR_EMAIL;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      !endpoint ||
      !accessKeyId ||
      !secretAccessKey ||
      !bucketName ||
      !publicUrl ||
      !curatorEmail ||
      !supabaseUrl ||
      !supabaseAnonKey
    ) {
      return NextResponse.json(
        { error: "The secure R2 upload settings are incomplete." },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "You must be signed in as curator." },
        { status: 401 }
      );
    }

    const accessToken = authorization.slice("Bearer ".length);

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Your curator session is no longer valid." },
        { status: 401 }
      );
    }

    if (
      !user.email ||
      user.email.toLowerCase() !== curatorEmail.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "This account is not authorized to upload postcards." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const cardNumber = Number(body.cardNumber);
    const side = body.side;
    const contentType = body.contentType;
    const fileSize = Number(body.fileSize);

    if (
      !Number.isInteger(cardNumber) ||
      cardNumber < 1 ||
      cardNumber > 3 ||
      (side !== "front" && side !== "back") ||
      contentType !== "image/jpeg" ||
      !Number.isFinite(fileSize) ||
      fileSize <= 0 ||
      fileSize > MAX_UPLOAD_SIZE
    ) {
      return NextResponse.json(
        { error: "The postcard upload information is invalid." },
        { status: 400 }
      );
    }

    const year = new Date().getFullYear();
    const key =
      `${year}/${Date.now()}-${crypto.randomUUID()}` +
      `-card-${cardNumber}-${side}.jpg`;

    const r2 = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
    });

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: "image/jpeg",
      CacheControl: "public, max-age=31536000, immutable",
    });

    const uploadUrl = await getSignedUrl(r2, command, {
      expiresIn: 300,
    });

    const encodedKey = key
      .split("/")
      .map((part) => encodeURIComponent(part))
      .join("/");

    return NextResponse.json({
      uploadUrl,
      publicUrl: `${publicUrl.replace(/\/$/, "")}/${encodedKey}`,
    });
  } catch (error) {
    console.error("R2 upload signing error:", error);

    return NextResponse.json(
      { error: "The museum could not prepare the R2 upload." },
      { status: 500 }
    );
  }
}