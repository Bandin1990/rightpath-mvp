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

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "รูปแบบคำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const parsedRequest = requestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return Response.json({ error: "กรุณาเล่าเรื่องอย่างน้อย 20 ตัวอักษรและยืนยันการใช้ AI" }, { status: 400 });
  }

  let env: CloudflareEnv | undefined;

  try {
    env = getCloudflareContext().env;
  } catch {
    env = undefined;
  }

  if (env?.AI_ASSIST_ENABLED !== "true") {
    return Response.json({ error: "โหมด AI ยังไม่เปิดใช้งาน กรุณาใช้โหมดไม่ใช้ AI" }, { status: 503 });
  }

  if (!env.AI) {
    return Response.json({ error: "ยังไม่ได้เชื่อม Cloudflare Workers AI" }, { status: 503 });
  }

  try {
    const result = (await env.AI.run("@cf/meta/llama-3.2-3b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: parsedRequest.data.story },
      ],
      max_tokens: 900,
      temperature: 0.1,
    })) as { response?: string };

    const parsedResponse = responseSchema.safeParse(extractJson(result.response ?? ""));
    if (!parsedResponse.success) throw new Error("AI response did not match the expected structure");

    return Response.json(
      {
        data: {
          mode: "ai",
          ...parsedResponse.data,
          disclaimer: "AI ช่วยเรียบเรียงเท่านั้น สิทธิ ความเสี่ยง และหน่วยงานยังต้องมาจากกฎและข้อมูลที่ผู้เชี่ยวชาญตรวจสอบ",
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "AI ไม่สามารถจัดระเบียบเรื่องได้ในขณะนี้ กรุณาใช้โหมดไม่ใช้ AI" }, { status: 502 });
  }
}
