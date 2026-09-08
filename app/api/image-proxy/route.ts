import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
) {
  try {
    const url =
      request.nextUrl.searchParams.get(
        "url",
      );

    if (!url) {
      return new Response(
        "Missing image URL",
        { status: 400 },
      );
    }

    const target = new URL(url);

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      return new Response(
        "Supabase URL is not configured",
        { status: 500 },
      );
    }

    const allowedOrigin =
      new URL(supabaseUrl).origin;

    if (target.origin !== allowedOrigin) {
      return new Response(
        "Image host not allowed",
        { status: 403 },
      );
    }

    const response = await fetch(
      target.toString(),
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return new Response(
        "Could not fetch image",
        {
          status: response.status,
        },
      );
    }

    const contentType =
      response.headers.get(
        "content-type",
      ) || "image/jpeg";

    if (!contentType.startsWith("image/")) {
      return new Response(
        "URL is not an image",
        { status: 400 },
      );
    }

    const buffer =
      await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error(
      "IMAGE PROXY ERROR:",
      error,
    );

    return new Response(
      "Image proxy failed",
      { status: 500 },
    );
  }
}