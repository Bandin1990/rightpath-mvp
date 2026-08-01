export async function GET() {
  return Response.json(
    { status: "ok", service: "rightpath-mvp" },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
