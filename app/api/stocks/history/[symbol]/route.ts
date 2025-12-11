/**
 * GET /api/stocks/history/[symbol]?period=1mo
 * 
 * Proxy route that fetches stock history from FastAPI backend
 * Protected route - requires authentication
 */
export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "1mo";

    // Call FastAPI backend (public endpoint)
    const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://fastapi:8000";
    const url = new URL(`${backendUrl}/stocks/history`);
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('period', period);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return new Response(JSON.stringify(errorData), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stock history error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to fetch stock history",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
