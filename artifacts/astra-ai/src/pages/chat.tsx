import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Send, Copy, Check, ThumbsUp, ThumbsDown,
  MoreHorizontal, Settings, HelpCircle, Compass,
  ChevronRight, Loader2, Square, X, Check as CheckIcon,
  Type, MessageCircle
} from "lucide-react";
import logoSrc from "@assets/ChatGPT_Image_May_23,_2026,_04_31_19_AM_1779569186602.png";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────── */
interface Message { id: string; role: "user" | "assistant"; content: string; createdAt: Date; }
interface Conversation { id: string; title: string; messages: Message[]; createdAt: Date; }

const FONTS = [
  { id: "plus-jakarta", label: "Plus Jakarta Sans", css: "'Plus Jakarta Sans', sans-serif", google: "Plus+Jakarta+Sans:wght@400;500;600;700" },
  { id: "inter",        label: "Inter",              css: "'Inter', sans-serif",              google: "Inter:wght@400;500;600;700" },
  { id: "poppins",      label: "Poppins",            css: "'Poppins', sans-serif",            google: "Poppins:wght@400;500;600;700" },
  { id: "sora",         label: "Sora",               css: "'Sora', sans-serif",               google: "Sora:wght@400;500;600;700" },
  { id: "outfit",       label: "Outfit",             css: "'Outfit', sans-serif",             google: "Outfit:wght@400;500;600;700" },
  { id: "montserrat",   label: "Montserrat",         css: "'Montserrat', sans-serif",         google: "Montserrat:wght@400;500;600;700" },
  { id: "urbanist",     label: "Urbanist",           css: "'Urbanist', sans-serif",           google: "Urbanist:wght@400;500;600;700" },
  { id: "roboto",       label: "Roboto",             css: "'Roboto', sans-serif",             google: "Roboto:wght@400;500;700" },
  { id: "space-grotesk",label: "Space Grotesk",      css: "'Space Grotesk', sans-serif",      google: "Space+Grotesk:wght@400;500;600;700" },
  { id: "nunito",       label: "Nunito",             css: "'Nunito', sans-serif",             google: "Nunito:wght@400;500;600;700" },
  { id: "playfair",     label: "Playfair Display",   css: "'Playfair Display', serif",        google: "Playfair+Display:wght@400;600;700" },
];

/* ─── Helpers ────────────────────────────────────────────── */
function generateId() { return Math.random().toString(36).slice(2, 10); }

function groupByDate(convs: Conversation[]) {
  const today = new Date(); const yest = new Date(today); yest.setDate(yest.getDate() - 1);
  const g: Record<string, Conversation[]> = {};
  for (const c of convs) {
    const d = new Date(c.createdAt);
    const lbl = d.toDateString() === today.toDateString() ? "Today" : d.toDateString() === yest.toDateString() ? "Yesterday" : "Older";
    (g[lbl] ??= []).push(c);
  }
  return g;
}

function loadFont(googleParam: string) {
  const id = "dynamic-font-" + googleParam.split(":")[0];
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id; link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${googleParam}&display=swap`;
  document.head.appendChild(link);
}

/* ─── Markdown renderer ─────────────────────────────────── */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { codeLines.push(lines[i]); i++; }
      elements.push(
        <div key={i} className="my-3 rounded-xl overflow-hidden border border-stone-200 bg-stone-50 text-sm">
          {lang && <div className="px-4 py-1.5 text-xs font-mono text-stone-500 border-b border-stone-200 bg-white/80">{lang}</div>}
          <pre className="p-4 font-mono text-stone-800 overflow-x-auto leading-relaxed whitespace-pre"><code>{codeLines.join("\n")}</code></pre>
        </div>
      );
      i++; continue;
    }
    // heading
    const hMatch = line.match(/^(#{1,3})\s+(.*)/);
    if (hMatch) {
      const lvl = hMatch[1].length;
      const cls = lvl === 1 ? "text-xl font-bold mt-4 mb-1 text-stone-900" : lvl === 2 ? "text-lg font-semibold mt-3 mb-1 text-stone-900" : "text-base font-semibold mt-2 mb-0.5 text-stone-800";
      elements.push(<p key={i} className={cls}>{inlineRender(hMatch[2])}</p>);
      i++; continue;
    }
    // bullet
    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) { items.push(lines[i].slice(2)); i++; }
      elements.push(<ul key={i} className="my-2 space-y-1 pl-4">{items.map((it, j) => <li key={j} className="flex gap-2 text-stone-700"><span className="text-stone-400 mt-1.5 flex-shrink-0">•</span><span>{inlineRender(it)}</span></li>)}</ul>);
      continue;
    }
    // numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      let n = 1;
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s/, "")); i++; n++; }
      elements.push(<ol key={i} className="my-2 space-y-1 pl-4">{items.map((it, j) => <li key={j} className="flex gap-2 text-stone-700"><span className="text-stone-400 flex-shrink-0 font-medium">{j+1}.</span><span>{inlineRender(it)}</span></li>)}</ol>);
      continue;
    }
    // empty
    if (!line.trim()) { elements.push(<div key={i} className="h-2" />); i++; continue; }
    // paragraph
    elements.push(<p key={i} className="text-stone-800 leading-relaxed">{inlineRender(line)}</p>);
    i++;
  }
  return elements;
}

function inlineRender(text: string): React.ReactNode[] {
  const parts = text.split(/(``[^`]+``|`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} className="font-semibold text-stone-900">{p.slice(2,-2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`")) return <code key={i} className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[0.85em] font-mono">{p.slice(1,-1)}</code>;
    if (p.startsWith("*") && p.endsWith("*")) return <em key={i} className="italic text-stone-700">{p.slice(1,-1)}</em>;
    return <span key={i}>{p}</span>;
  });
}

/* ─── Help & Feedback Modal ─────────────────────────────── */
function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle"|"sending"|"success"|"error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const send = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) { setErrMsg("Please fill in all fields."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setErrMsg("Please enter a valid email."); return; }
    setStatus("sending"); setErrMsg("");
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      const data = await r.json();
      if (!r.ok) { setErrMsg(data.error ?? "Failed to send. Please try again."); setStatus("error"); return; }
      setStatus("success");
    } catch { setErrMsg("Network error. Please try again."); setStatus("error"); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5B4E8C] to-[#7B6AB0] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Help & Feedback</h2>
              <p className="text-white/70 text-xs">We'd love to hear from you 💬</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="p-6">
          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-6 gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center">
                <CheckIcon className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-center">
                <p className="font-bold text-stone-800 text-lg">Feedback sent successfully 🚀</p>
                <p className="text-stone-500 text-sm mt-1">Thank you! We'll get back to you soon.</p>
              </div>
              <button onClick={onClose} className="mt-2 px-6 py-2.5 rounded-xl bg-[#5B4E8C] text-white text-sm font-semibold hover:bg-[#4A3D7A] transition-colors">
                Close
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Your Name</label>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  data-testid="input-feedback-name"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4E8C]/30 focus:border-[#5B4E8C]/50 placeholder:text-stone-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Email Address</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  data-testid="input-feedback-email"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4E8C]/30 focus:border-[#5B4E8C]/50 placeholder:text-stone-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1.5">Message</label>
                <textarea
                  value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Share your thoughts, report a bug, or ask for help..."
                  data-testid="input-feedback-message"
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#5B4E8C]/30 focus:border-[#5B4E8C]/50 placeholder:text-stone-400 resize-none transition-all"
                />
              </div>
              {errMsg && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs flex items-center gap-1.5">
                  <span>⚠️</span> {errMsg}
                </motion.p>
              )}
              <button
                onClick={send}
                disabled={status === "sending"}
                data-testid="button-send-feedback"
                className={cn(
                  "w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                  status === "sending"
                    ? "bg-[#5B4E8C]/60 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#5B4E8C] to-[#7B6AB0] hover:from-[#4A3D7A] hover:to-[#6A59A0] shadow-md hover:shadow-lg shadow-[#5B4E8C]/20"
                )}
              >
                {status === "sending" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Feedback</>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Settings Modal ────────────────────────────────────── */
function SettingsModal({ onClose, currentFont, onFontChange }: {
  onClose: () => void;
  currentFont: string;
  onFontChange: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5B4E8C] to-[#7B6AB0] px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Type className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Settings</h2>
              <p className="text-white/70 text-xs">Personalise your experience ✨</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-stone-700 mb-1">Font Style</h3>
            <p className="text-xs text-stone-400 mb-4">Choose a font for the entire app — changes apply instantly.</p>
            <div className="space-y-2">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onFontChange(f.id)}
                  data-testid={`font-option-${f.id}`}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left",
                    currentFont === f.id
                      ? "border-[#5B4E8C]/40 bg-[#5B4E8C]/8 ring-1 ring-[#5B4E8C]/20"
                      : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] text-stone-800" style={{ fontFamily: f.css }}>{f.label}</span>
                    <span className="text-xs text-stone-400" style={{ fontFamily: f.css }}>Aa Bb Cc</span>
                  </div>
                  {currentFont === f.id && (
                    <div className="w-5 h-5 rounded-full bg-[#5B4E8C] flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Message components ─────────────────────────────────── */
function AssistantMessage({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<"up"|"down"|null>(null);
  const copy = () => { navigator.clipboard.writeText(message.content); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="group py-3">
      <div className="text-[15px] leading-relaxed space-y-1">{renderMarkdown(message.content)}</div>
      <div className="flex items-center gap-1 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button onClick={copy} className="flex items-center gap-1 px-2 py-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all text-xs">
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => setLiked(liked==="up"?null:"up")} className={cn("px-2 py-1 rounded-lg transition-all", liked==="up"?"text-green-600 bg-green-50":"text-stone-400 hover:text-stone-600 hover:bg-stone-100")}>
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => setLiked(liked==="down"?null:"down")} className={cn("px-2 py-1 rounded-lg transition-all", liked==="down"?"text-red-500 bg-red-50":"text-stone-400 hover:text-stone-600 hover:bg-stone-100")}>
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
        <button className="px-2 py-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

function UserMessage({ message }: { message: Message }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="flex justify-end py-2">
      <div className="max-w-[72%] bg-white border border-stone-200 rounded-2xl rounded-br-sm px-4 py-2.5 text-stone-800 text-[15px] shadow-sm leading-relaxed">
        {message.content}
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="py-3 flex items-center gap-1.5">
      {[0,1,2].map(i => (
        <motion.div key={i} className="w-2 h-2 rounded-full bg-stone-400"
          animate={{ opacity:[0.4,1,0.4], y:[0,-3,0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i*0.18 }} />
      ))}
    </div>
  );
}

const STARTERS = [
  "What's something surprising about the universe? 🌌",
  "Help me write a short story opening ✍️",
  "Explain recursion like I'm 10 🧒",
  "What should I learn next in programming? 💻",
];

/* ─── Main ChatPage ──────────────────────────────────────── */
export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [modal, setModal] = useState<"none"|"feedback"|"settings">("none");
  const [currentFontId, setCurrentFontId] = useState<string>(() => localStorage.getItem("astra-font") ?? "plus-jakarta");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const active = conversations.find(c => c.id === activeId) ?? null;

  /* Font management */
  useEffect(() => {
    const font = FONTS.find(f => f.id === currentFontId) ?? FONTS[0];
    loadFont(font.google);
    document.documentElement.style.setProperty("--app-font", font.css);
    document.documentElement.style.fontFamily = font.css;
    localStorage.setItem("astra-font", currentFontId);
  }, [currentFontId]);

  /* Load saved font on mount */
  useEffect(() => {
    const saved = localStorage.getItem("astra-font");
    if (saved && FONTS.find(f => f.id === saved)) setCurrentFontId(saved);
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active?.messages.length]);

  const stopGenerating = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  };

  const startNew = useCallback(() => { setActiveId(null); setInput(""); textareaRef.current?.focus(); }, []);
  const deleteConv = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(p => p.filter(c => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    let convId = activeId;
    let priorMessages: Message[] = [];

    if (!convId) {
      const id = generateId();
      convId = id;
      setConversations(p => [{ id, title: trimmed.slice(0, 50), messages: [], createdAt: new Date() }, ...p]);
      setActiveId(id);
    } else {
      priorMessages = active?.messages ?? [];
    }

    const userMsg: Message = { id: generateId(), role: "user", content: trimmed, createdAt: new Date() };
    const assistantId = generateId();
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", createdAt: new Date() };

    setConversations(p => p.map(c => c.id !== convId ? c : { ...c, messages: [...c.messages, userMsg, assistantMsg] }));
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const payload = [...priorMessages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
        signal: controller.signal,
      });
      if (!resp.ok || !resp.body) throw new Error(`HTTP ${resp.status}`);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;

      while (!done) {
        const { done: sd, value } = await reader.read();
        if (sd) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const evt = JSON.parse(raw);
            if (evt.done) { done = true; break; }
            if (evt.content) {
              setConversations(p => p.map(c => c.id !== convId ? c : {
                ...c,
                messages: c.messages.map(m => m.id === assistantId ? { ...m, content: m.content + evt.content } : m)
              }));
            }
          } catch {}
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        /* Stopped by user — keep partial content, do nothing */
      } else {
        setConversations(p => p.map(c => c.id !== convId ? c : {
          ...c,
          messages: c.messages.map(m => m.id === assistantId && m.content === ""
            ? { ...m, content: "Something went wrong. Please try again. 🙏" }
            : m)
        }));
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [activeId, active, isStreaming]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const isEmpty = !active || active.messages.length === 0;
  const isTyping = isStreaming && active?.messages.at(-1)?.role === "assistant" && active.messages.at(-1)?.content === "";
  const groups = groupByDate(conversations);
  const currentFont = FONTS.find(f => f.id === currentFontId) ?? FONTS[0];

  return (
    <div className="flex h-[100dvh] w-full bg-[#F5F0E8] overflow-hidden" style={{ fontFamily: currentFont.css }}>

      {/* ── Sidebar ── */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-[#EDE8DF] border-r border-stone-200/80">
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <img src={logoSrc} alt="ASTRA.AI 2 logo" className="w-7 h-7 object-contain rounded-lg" />
            <span className="text-[#2D2416] font-bold tracking-wide text-base">ASTRA.AI 2</span>
          </div>
        </div>
        <div className="px-3 pb-2 space-y-0.5">
          <button onClick={startNew} data-testid="button-new-chat" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#2D2416] hover:bg-stone-200/60 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4 text-stone-500" /> New chat
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#2D2416] hover:bg-stone-200/60 transition-colors text-sm font-medium">
            <Compass className="w-4 h-4 text-stone-500" /> Discover
          </button>
        </div>
        <div className="mx-4 border-t border-stone-300/50 my-1" />

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {conversations.length === 0
            ? <p className="text-xs text-stone-400 text-center py-6">No conversations yet</p>
            : Object.entries(groups).map(([label, convs]) => (
              <div key={label}>
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-3 mb-1">{label}</p>
                <div className="space-y-0.5">
                  {convs.map(conv => (
                    <div key={conv.id} data-testid={`conv-${conv.id}`} onClick={() => setActiveId(conv.id)}
                      className={cn("group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all text-sm",
                        activeId === conv.id ? "bg-[#D4CFC7] text-[#2D2416] font-medium" : "text-stone-600 hover:bg-stone-200/50 hover:text-stone-900")}>
                      <span className="truncate flex-1 text-[13px]">{conv.title}</span>
                      <button onClick={e => deleteConv(conv.id, e)} className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-400 transition-all flex-shrink-0">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          }
        </div>

        <div className="px-3 pb-4 space-y-0.5 border-t border-stone-300/50 pt-3">
          <button onClick={() => setModal("feedback")} data-testid="button-help-feedback"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 hover:bg-stone-200/60 hover:text-stone-900 transition-colors text-sm">
            <HelpCircle className="w-4 h-4" /> Help &amp; feedback
          </button>
          <button onClick={() => setModal("settings")} data-testid="button-settings"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-600 hover:bg-stone-200/60 hover:text-stone-900 transition-colors text-sm">
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center gap-8 px-6">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#5B4E8C]/10 border border-[#5B4E8C]/20 flex items-center justify-center mx-auto mb-5">
                  <img src={logoSrc} alt="ASTRA.AI 2" className="w-8 h-8 object-contain" />
                </div>
                <h2 className="text-2xl font-bold text-[#2D2416] mb-1">Hi, I'm ASTRA 2 👋</h2>
                <p className="text-stone-500 text-sm">What's on your mind? ✨</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                {STARTERS.map(s => (
                  <button key={s} onClick={() => send(s)} data-testid={`starter-${s.slice(0,8).toLowerCase().replace(/\s+/g,"-")}`}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-stone-200 hover:border-[#5B4E8C]/30 hover:bg-[#5B4E8C]/5 text-left text-[13px] text-stone-700 hover:text-stone-900 transition-all shadow-sm group">
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#5B4E8C] flex-shrink-0 transition-colors" />
                    {s}
                  </button>
                ))}
              </motion.div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto w-full px-6 py-6">
              {active!.messages.map(msg =>
                msg.role === "user"
                  ? <UserMessage key={msg.id} message={msg} />
                  : <AssistantMessage key={msg.id} message={msg} />
              )}
              <AnimatePresence>
                {isTyping && <motion.div key="typing" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}><TypingDots /></motion.div>}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Input ── */}
        <div className="px-6 pb-5 pt-3">
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-white border border-stone-200 rounded-3xl shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-stone-300 transition-all overflow-hidden">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"; }}
                onKeyDown={handleKey}
                placeholder="What's on your mind?"
                data-testid="input-message"
                rows={1}
                disabled={isStreaming}
                className="w-full resize-none bg-transparent px-5 pt-4 pb-14 text-[15px] text-stone-800 placeholder:text-stone-400 focus:outline-none leading-relaxed min-h-[56px] max-h-[160px] disabled:opacity-60"
              />
              <div className="absolute bottom-3 right-3">
                <AnimatePresence mode="wait">
                  {isStreaming ? (
                    <motion.button
                      key="stop"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={stopGenerating}
                      data-testid="button-stop"
                      className="w-9 h-9 rounded-full flex items-center justify-center bg-stone-800 hover:bg-red-500 text-white shadow-md transition-colors"
                      title="Stop generating"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                    </motion.button>
                  ) : (
                    <motion.button
                      key="send"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => send(input)}
                      data-testid="button-send"
                      disabled={!input.trim()}
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200",
                        input.trim()
                          ? "bg-[#5B4E8C] hover:bg-[#4A3D7A] text-white shadow-md"
                          : "bg-stone-200 text-stone-400 cursor-not-allowed"
                      )}
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <p className="text-center text-[11px] text-stone-400 mt-2.5">
              ASTRA.AI 2 may make mistakes — double-check important info.
            </p>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal === "feedback" && <FeedbackModal onClose={() => setModal("none")} />}
        {modal === "settings" && (
          <SettingsModal
            onClose={() => setModal("none")}
            currentFont={currentFontId}
            onFontChange={id => setCurrentFontId(id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
