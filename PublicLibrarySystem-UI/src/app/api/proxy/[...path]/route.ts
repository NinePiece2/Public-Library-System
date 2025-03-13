import { NextRequest, NextResponse } from "next/server";
import { protectedProxyRequest } from "../../../../../lib/protectedProxy";

const API_BASE_URL = process.env.API_BASE_URL;
if (!API_BASE_URL) {
    throw new Error("API_BASE_URL not configured");
}

/**
 * Handles all HTTP methods dynamically and proxies requests.
 */
export async function GET(req: NextRequest, context: { params: { path?: string[] } }) {
    return proxyRequest(req, await context.params, "GET");
}

export async function POST(req: NextRequest, context: { params: { path?: string[] } }) {
    return proxyRequest(req, await context.params, "POST");
}

export async function PUT(req: NextRequest, context: { params: { path?: string[] } }) {
    return proxyRequest(req, await context.params, "PUT");
}

export async function DELETE(req: NextRequest, context: { params: { path?: string[] } }) {
    return proxyRequest(req, await context.params, "DELETE");
}

/**
 * Helper function to authenticate and proxy requests to the .NET API.
 */
async function proxyRequest(req: NextRequest, params: { path?: string[] }, method: string) {
    const pathSegments = params?.path;
    
    if (!pathSegments || pathSegments.length === 0) {
        return NextResponse.json({ error: "Invalid API path" }, { status: 400 });
    }

    try {
        const url = `${API_BASE_URL}/${pathSegments.join("/")}`;

        // Prepare request options
        const options: RequestInit = {
            method,
            headers: Object.fromEntries(req.headers.entries()), // Forward headers
        };

        // Include body for non-GET requests
        if (method !== "GET") {
            options.body = await req.text();
        }

        // Use the protected proxy to make the request
        const response = await protectedProxyRequest(url, options);
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