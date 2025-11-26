import { NextRequest, NextResponse } from "next/server";

const GENKIT_URL = process.env.GENKIT_URL || "http://localhost:3400";

async function handler(req: NextRequest) {
    const path = req.nextUrl.pathname.replace("/api/genkit", "");
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
        return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    try {
        const response = await fetch(`${GENKIT_URL}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader
            },
            body: JSON.stringify(await req.json()),
        });

        if (!response.ok) {
            const errorData = await response.text(); 
            console.error(`[PROXY ERROR] Genkit returned status ${response.status}:`, errorData);
            return NextResponse.json({ error: `Genkit error: ${errorData}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });

    } catch (error) {
        console.error("[PROXY FATAL]", error);
        return NextResponse.json({ error: "Genkit Proxy Error" }, { status: 500 });
    }
}


export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH, handler as OPTIONS };