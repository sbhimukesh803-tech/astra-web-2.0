import { Router, type IRouter } from "express";

const router: IRouter = Router();

const lastSubmission: Map<string, number> = new Map();

router.post("/feedback", async (req, res) => {
  const { name, email, message } = req.body as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    res.status(400).json({ error: "Name, email, and message are required." });
    return;
  }

  if (name.trim().length > 100 || email.trim().length > 200 || message.trim().length > 2000) {
    res.status(400).json({ error: "Input too long." });
    return;
  }

  const ip = String(req.ip ?? req.socket.remoteAddress ?? "unknown");
  const now = Date.now();
  const last = lastSubmission.get(ip) ?? 0;
  if (now - last < 60_000) {
    res.status(429).json({ error: "Please wait a minute before sending another message." });
    return;
  }
  lastSubmission.set(ip, now);

  const apiKey = process.env.TEXTMEBOT_API_KEY;
  const phoneNumber = process.env.TEXTMEBOT_PHONE ?? "+919876543210";

  if (!apiKey) {
    req.log.error("TEXTMEBOT_API_KEY not set");
    res.status(500).json({ error: "Feedback service not configured." });
    return;
  }

  const timeStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const text = [
    "🚀 New ASTRA.AI 2 Feedback",
    "",
    `👤 Name: ${name.trim()}`,
    `📧 Email: ${email.trim()}`,
    "",
    "💬 Message:",
    message.trim(),
    "",
    `🕒 Time: ${timeStr}`,
  ].join("\n");

  try {
    const params = new URLSearchParams({
      apikey: apiKey,
      phone: phoneNumber,
      message: text,
    });

    const response = await fetch(
      `https://api.textmebot.com/send.php?${params.toString()}`,
      { method: "GET" }
    );

    const body = await response.text();
    req.log.info({ status: response.status, body }, "TextMeBot response");

    if (!response.ok && response.status !== 200) {
      res.status(502).json({ error: "Failed to send message. Please try again." });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error(err, "TextMeBot send error");
    res.status(500).json({ error: "Unexpected error sending feedback." });
  }
});

export default router;
