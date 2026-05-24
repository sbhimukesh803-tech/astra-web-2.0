import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

type FlushableResponse = import("express").Response & { flush?: () => void };

function sseWrite(res: FlushableResponse, data: unknown) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
  res.flush?.();
}

async function streamGemini(messages: Message[], res: FlushableResponse): Promise<boolean> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return false;

  const geminiMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const systemInstruction = messages.find((m) => m.role === "system");
  const body: Record<string, unknown> = {
    contents: geminiMessages,
    generationConfig: { maxOutputTokens: 8192 },
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction.content }] };
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );

  if (!response.ok || !response.body) return false;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) sseWrite(res, { content: text });
        } catch {}
      }
    }
  }
  return true;
}

async function streamGroq(messages: Message[], res: FlushableResponse): Promise<boolean> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return false;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, stream: true, max_tokens: 8192 }),
  });

  if (!response.ok || !response.body) return false;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed?.choices?.[0]?.delta?.content;
          if (content) sseWrite(res, { content });
        } catch {}
      }
    }
  }
  return true;
}

async function streamMistral(messages: Message[], res: FlushableResponse): Promise<boolean> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return false;

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "mistral-large-latest", messages, stream: true, max_tokens: 8192 }),
  });

  if (!response.ok || !response.body) return false;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const content = parsed?.choices?.[0]?.delta?.content;
          if (content) sseWrite(res, { content });
        } catch {}
      }
    }
  }
  return true;
}

router.post("/chat", async (req, res: FlushableResponse) => {
  const { messages } = req.body as { messages: Message[] };

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const SYSTEM_PROMPT = `You are ASTRA, a smart, warm, and genuinely helpful AI assistant. 🌟

Your personality:
- Friendly and conversational — like a brilliant friend who knows everything
- Clear, structured, and easy to read
- Naturally expressive — use relevant emojis to add warmth (😊 ✨ 🚀 💡 🎯) but NEVER overuse them
- Professional yet approachable

Your response style:
- Use **bold** for key terms and important points
- Use bullet points or numbered lists for multi-part answers
- Use headings (## or ###) for longer, structured responses
- Keep paragraphs short — max 3-4 sentences each
- Use code blocks with language tags for all code
- For short/casual messages, reply conversationally without heavy formatting
- Divide long answers into clear sections
- Always end complex answers with a helpful closing note or follow-up offer

Tone examples:
- Greeting: "Hey! 👋 Great to meet you! How can I help today? 😊"
- Technical: "Here's how that works 🔧" then structured explanation
- Creative: Engaging, imaginative, with personality
- Error help: Empathetic, clear, solution-focused 💪

Never be robotic. Never write walls of text. Always feel human, warm, and sharp.`;

  const fullMessages: Message[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ];

  try {
    let success = await streamGemini(fullMessages, res);
    if (!success) {
      req.log.warn("Gemini failed, trying Groq");
      success = await streamGroq(fullMessages, res);
    }
    if (!success) {
      req.log.warn("Groq failed, trying Mistral");
      success = await streamMistral(fullMessages, res);
    }
    if (!success) {
      sseWrite(res, { content: "All AI providers are currently unavailable. Please try again later. 🙏" });
    }
  } catch (err) {
    req.log.error(err, "Chat stream error");
    sseWrite(res, { content: "\n\n[Connection error — please try again 🔄]" });
  }

  sseWrite(res, { done: true });
  res.end();
});

export default router;
