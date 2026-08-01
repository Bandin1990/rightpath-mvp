import { getCloudflareContext } from "@opennextjs/cloudflare";
import { z } from "zod";

const requestSchema = z.object({
  story: z.string().trim().min(20).max(5000),
  consent: z.literal(true),
});

const responseSchema = z.object({
  summary: z.string().min(1).max(2000),
  capturedFields: z.array(z.string().min(1).max(160)).max(12),
  missingQuestions: z.array(z.string().min(1).max(300)).max(8),
});

const responseFormat = {
  type: "json_schema",
  json_schema: {
    type: "object",
    properties: {
      summary: { type: "string" },
      capturedFields: {
        type: "array",
        items: { type: "string" },
        maxItems: 12,
      },
      missingQuestions: {
        type: "array",
        items: { type: "string" },
        maxItems: 8,
      },
    },
    required: ["summary", "capturedFields", "missingQuestions"],
    additionalProperties: false,
  },
} as const;

const noStoreHeaders = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

const systemPrompt = `คุณเป็นผู้ช่วยจัดระเบียบข้อเท็จจริงภาษาไทยสำหรับประชาชน
หน้าที่ของคุณมีเพียงสรุปเรื่องตามที่ผู้ใช้เล่า ระบุหัวข้อข้อมูลที่มีแล้ว และถามข้อมูลสำคัญที่ยังขาด
ห้ามตัดสินว่ามีการละเมิดสิทธิ ห้ามเลือกหน่วยงาน ห้ามแต่งข้อเท็จจริง ห้ามเพิ่มชื่อกฎหมายหรือมาตรา
แยกสิ่งที่ผู้ใช้พบเห็นออกจากข้อสันนิษฐาน และใช้ภาษาที่สุภาพ เข้าใจง่าย
ตอบเป็น JSON เท่านั้นในรูปแบบ {"summary":"...","capturedFields":["..."],"missingQuestions":["..."]}`;

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/iu)?.[1] ?? text;
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI response did not contain JSON");
  return JSON.parse(fenced.slice(start, end + 1)) as unknown;
}

function errorResponse(error: string, status: number, headers?: Record<string, string>) {
  return Response.json({ error }, { status, headers: { ...noStoreHeaders, ...headers } });
}

async function createRateLimitKey(request: Request) {
  const clientAddress = request.headers.get("CF-Connecting-IP") ?? "unknown-client";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(clientAddress));
  const anonymizedClient = Array.from(new Uint8Array(digest).slice(0, 16), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `story-assist:${anonymizedClient}`;
}

export async function POST(request: Request) {
  let env: CloudflareEnv | undefined;

  try {
    env = getCloudflareContext().env;
  } catch {
    env = undefined;
  }

  if (env?.AI_ASSIST_ENABLED !== "true") {
    return errorResponse("โหมด AI ยังไม่เปิดใช้งาน กรุณาใช้โหมดไม่ใช้ AI", 503);
  }

  if (!env.AI || !env.AI_RATE_LIMITER) {
    return errorResponse("Cloudflare Workers AI หรือระบบจำกัดการใช้งานยังไม่พร้อม", 503);
  }

  try {
    const rateLimit = await env.AI_RATE_LIMITER.limit({ key: await createRateLimitKey(request) });
    if (!rateLimit.success) {
      return errorResponse("มีการเรียกใช้ AI ถี่เกินไป กรุณารอประมาณหนึ่งนาทีแล้วลองใหม่", 429, { "Retry-After": "60" });
    }
  } catch {
    return errorResponse("ระบบจำกัดการใช้งาน AI ไม่พร้อม จึงหยุดการเรียก AI เพื่อความปลอดภัย", 503);
  }

  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return errorResponse("รองรับเฉพาะคำขอ JSON", 415);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > 12_000) {
    return errorResponse("ข้อความยาวเกินขนาดที่ระบบรับได้", 413);
  }

  let body: unknown;

  try {
    const rawBody = await request.text();
    if (rawBody.length > 12_000) return errorResponse("ข้อความยาวเกินขนาดที่ระบบรับได้", 413);
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return errorResponse("รูปแบบคำขอไม่ถูกต้อง", 400);
  }

  const parsedRequest = requestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return errorResponse("กรุณาเล่าเรื่องอย่างน้อย 20 ตัวอักษรและยืนยันการใช้ AI", 400);
  }

  try {
    const result = (await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: parsedRequest.data.story },
      ],
      response_format: responseFormat,
      max_tokens: 700,
      temperature: 0.1,
    })) as { response?: string | unknown };

    const candidate = typeof result.response === "string" ? extractJson(result.response) : result.response;
    const parsedResponse = responseSchema.safeParse(candidate);
    if (!parsedResponse.success) throw new Error("AI response did not match the expected structure");

    return Response.json(
      {
        data: {
          mode: "ai",
          ...parsedResponse.data,
          disclaimer: "AI ช่วยเรียบเรียงเท่านั้น สิทธิ ความเสี่ยง และหน่วยงานยังต้องมาจากกฎและข้อมูลที่ผู้เชี่ยวชาญตรวจสอบ",
        },
      },
      { headers: noStoreHeaders },
    );
  } catch {
    return errorResponse("AI ไม่สามารถจัดระเบียบเรื่องได้ในขณะนี้ กรุณาใช้โหมดไม่ใช้ AI", 502);
  }
}
