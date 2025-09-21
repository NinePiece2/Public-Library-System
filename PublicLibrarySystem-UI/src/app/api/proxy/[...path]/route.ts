import { NextRequest, NextResponse } from "next/server";
import { protectedProxyRequest } from "../../../../../lib/protectedProxy";

const API_BASE_URL = process.env.API_BASE_URL;
// if (!API_BASE_URL) {
//   throw new Error("API_BASE_URL not configured");
// }

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const { params } = context;
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams, "GET");
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { params } = context;
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams, "POST");
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { params } = context;
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams, "PUT");
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { params } = context;
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams, "DELETE");
}

/**
 * Helper function to authenticate and proxy requests to the .NET API.
 */
async function proxyRequest(
  req: NextRequest,
  params: { path: string[] },
  method: string
) {
  const pathSegments = params.path;

  if (!pathSegments || pathSegments.length === 0) {
    return NextResponse.json({ error: "Invalid API path" }, { status: 400 });
  }

  try {
    // Create a URL object to allow appending search parameters for GET requests
    const url = new URL(`${API_BASE_URL}/${pathSegments.join("/")}`);
    if (method === "GET") {
      // Append the query string to the URL
      url.search = req.nextUrl.search;
    }

    // Filter headers to remove disallowed ones
    const filteredHeaders = filterHeaders(req.headers);

    // Prepare request options
    const options: RequestInit = {
      method,
      headers: filteredHeaders,
    };

    // Include body for non-GET requests
    if (method !== "GET") {
      options.body = await req.text();
    }

    const response = await protectedProxyRequest(url.toString(), options);
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return new NextResponse(text, { status: response.status });
    }
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function filterHeaders(headers: Headers): Record<string, string> {
  const disallowed = [
    "connection",
    "host",
    "keep-alive",
    "proxy-connection",
    "transfer-encoding",
    "upgrade",
  ];
  return Object.fromEntries(
    Array.from(headers.entries()).filter(
      ([key]) => !disallowed.includes(key.toLowerCase())
    )
  );
}
