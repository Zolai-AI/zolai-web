"use client";

import * as React from "react";
import Link from "next/link";
import { PanelLeft, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ChatMessage as Msg } from "@/features/zolai/api/chat";
import { useAIModels } from "@/features/zolai/hooks/useAIModels";
import { useAIStatus } from "@/features/zolai/hooks/useAIStatus";
import { useChatHistory, useChatMessages } from "@/features/zolai/hooks/useChatHistory";
import { useChatSend } from "@/features/zolai/hooks/useChatSend";

const DEFAULT_MODEL = "gemini-3-flash";
const WELCOME: Msg = { role: "assistant", content: "Kum. What do you want to practice (Tedim)?" };

function appendAssistantDelta(setter: React.Dispatch<React.SetStateAction<Msg[]>>, delta: string) {
  setter((prev) => {
    const next = [...prev];
    const lastIdx = next.length - 1;
    if (lastIdx >= 0 && next[lastIdx].role === "assistant") {
      next[lastIdx] = { ...next[lastIdx], content: next[lastIdx].content + delta };
    }
    return next;
  });
}

function setLastAssistantContent(setter: React.Dispatch<React.SetStateAction<Msg[]>>, content: string) {
  setter((prev) => {
    const next = [...prev];
    const lastIdx = next.length - 1;
    if (lastIdx >= 0 && next[lastIdx].role === "assistant") {
      next[lastIdx] = { ...next[lastIdx], content };
    } else {
      next.push({ role: "assistant", content });
    }
    return next;
  });
}

function useAutoScroll(dep: unknown) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTop = ref.current.scrollHeight;
  }, [dep]);
  return ref;
}

export function ChatApp() {
  // Models, chat history, and backend status are server caches owned by react-query.
  const modelsQuery = useAIModels();
  const models = React.useMemo(() => modelsQuery.data ?? [], [modelsQuery.data]);
  const historyQuery = useChatHistory();
  const history = React.useMemo(() => historyQuery.data ?? [], [historyQuery.data]);
  const statusQuery = useAIStatus();

  const [model, setModel] = React.useState<string>(DEFAULT_MODEL);
  const [threadId, setThreadId] = React.useState<string | null>(null);
  const [providerChatId, setProviderChatId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Msg[]>([WELCOME]);
  const [input, setInput] = React.useState("");
  const [sendNote, setSendNote] = React.useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState<boolean>(false);

  const messageListRef = useAutoScroll(messages);

  // Keep the selected model valid once the catalogue arrives.
  React.useEffect(() => {
    if (models.length > 0 && !models.includes(model)) setModel(models[0]);
  }, [models, model]);

  const status = statusQuery.data;
  const statusOk = status ? status.ok : null;

  // Opened thread: fetched by useChatMessages(threadId); applied to local chat
  // state once per successful fetch so streaming edits are not clobbered.
  const chatQuery = useChatMessages(threadId);
  const appliedThreadRef = React.useRef<typeof chatQuery.data>(undefined);
  const appliedThreadErrorRef = React.useRef<Error | null>(null);

  React.useEffect(() => {
    if (!threadId) return;
    if (chatQuery.data && chatQuery.data !== appliedThreadRef.current) {
      appliedThreadRef.current = chatQuery.data;
      setProviderChatId(chatQuery.data.providerChatId);
      setMessages(chatQuery.data.messages.length ? chatQuery.data.messages : [{ role: "assistant", content: "Chat is empty." }]);
      setMobileSidebarOpen(false);
    } else if (chatQuery.error && chatQuery.error !== appliedThreadErrorRef.current) {
      appliedThreadErrorRef.current = chatQuery.error as Error;
      setMessages([{ role: "assistant", content: `Error loading chat: ${chatQuery.error.message}` }]);
    }
  }, [threadId, chatQuery.data, chatQuery.error]);

  const openChat = React.useCallback((id: string) => {
    setThreadId(id);
    setProviderChatId(null);
    setSendNote(null);
  }, []);

  const newChat = React.useCallback(() => {
    setThreadId(null);
    setProviderChatId(null);
    setMessages([WELCOME]);
    setSendNote(null);
    setMobileSidebarOpen(false);
  }, []);

  // Send: thread creation, message persistence, SSE streaming, and the
  // non-streaming fallback all live in the transports behind useChatSend.
  const sendMutation = useChatSend();
  const streaming = sendMutation.isPending;

  const statusText =
    sendNote ??
    (status && !status.ok ? status.message : null);

  const send = React.useCallback(() => {
    const text = input.trim();
    if (!text || streaming) return;

    setInput("");
    setSendNote(null);
    sendMutation.mutate(
      {
        chatId: threadId,
        providerChatId,
        model,
        history: messages,
        text,
        onDelta: (delta) => appendAssistantDelta(setMessages, delta),
        onChatCreated: (id) => setThreadId(id),
        onProviderChatId: (id) => setProviderChatId(id),
      },
      {
        onSuccess: (result) => {
          if (result.usedFallback) {
            setLastAssistantContent(setMessages, result.content);
            setSendNote("Streaming failed; used fallback response.");
          }
        },
        onError: (error) => {
          setSendNote(error.message);
          setLastAssistantContent(setMessages, `Error: ${error.message}`);
        },
      },
    );
  }, [input, streaming, sendMutation, threadId, providerChatId, model, messages]);

  return (
    <div className="h-[calc(100vh-180px)] min-h-[650px] rounded-xl border bg-background overflow-hidden">
      <div className={cn("grid h-full grid-cols-1", sidebarOpen ? "md:grid-cols-[320px_1fr]" : "md:grid-cols-[1fr]")}>
        {/* Sidebar */}
        {sidebarOpen && (
        <aside className="hidden md:flex flex-col border-r bg-muted/20">
          <div className="p-3 flex items-center gap-2 border-b bg-background/60">
            <Button size="sm" onClick={newChat}>New chat</Button>
            <div className="ml-auto text-xs text-muted-foreground">
              <Link href="http://localhost:8000" className="underline underline-offset-2">gemini-server</Link>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 flex flex-col gap-1">
              {history.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">No chats yet.</div>
              ) : history.map((h) => (
                <button
                  key={h.id}
                  className={cn(
                    "text-left rounded-lg px-3 py-2 text-sm hover:bg-muted/50 transition-colors",
                    threadId === h.id ? "bg-muted/60" : "",
                  )}
                  onClick={() => openChat(h.id)}
                >
                  <div className="truncate font-medium">{h.title || h.id}</div>
                  {h.updated_at && <div className="truncate text-xs text-muted-foreground">{h.updated_at}</div>}
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>
        )}

        {/* Mobile sidebar drawer */}
        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileSidebarOpen(false)}>
            <div className="absolute inset-y-0 left-0 w-[85vw] max-w-[360px] bg-background border-r shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="p-3 flex items-center gap-2 border-b">
                <Button size="sm" onClick={newChat}>New</Button>
                <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setMobileSidebarOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-64px)]">
                <div className="p-2 flex flex-col gap-1">
                  {history.map((h) => (
                    <button
                      key={h.id}
                      className={cn(
                        "text-left rounded-lg px-3 py-2 text-sm hover:bg-muted/50 transition-colors",
                        threadId === h.id ? "bg-muted/60" : "",
                      )}
                      onClick={() => openChat(h.id)}
                    >
                      <div className="truncate font-medium">{h.title || h.id}</div>
                      {h.updated_at && <div className="truncate text-xs text-muted-foreground">{h.updated_at}</div>}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Main */}
        <section className="flex flex-col min-w-0">
          <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur p-3">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="md:hidden" onClick={() => setMobileSidebarOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="hidden md:inline-flex" onClick={() => setSidebarOpen((v) => !v)}>
                <PanelLeft className="h-4 w-4" />
              </Button>
              <div className="font-semibold">Chat</div>
              <div className="ml-auto flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full border",
                    statusOk === true && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    statusOk === false && "border-destructive/30 bg-destructive/10 text-destructive",
                    statusOk === null && "border-muted-foreground/20 text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      statusOk === true && "bg-emerald-500",
                      statusOk === false && "bg-destructive",
                      statusOk === null && "bg-muted-foreground/40",
                    )}
                  />
                  {statusOk === true ? "Ready" : statusOk === false ? "Not ready" : "Unknown"}
                </span>

                <div className="hidden sm:flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">Model</div>
                  <select
                    className="h-8 rounded-md border bg-background px-2 text-sm"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={streaming}
                  >
                    {(models.length ? models : [model]).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <Button size="sm" variant="outline" onClick={() => void statusQuery.refetch()} disabled={streaming}>
                  Status
                </Button>
              </div>
            </div>

            {statusText && (
              <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
                <div className="font-medium mb-1">Gemini server issue</div>
                <div className="text-muted-foreground break-words">{statusText}</div>
                <div className="mt-2 text-xs">
                  Fix: open <a className="underline underline-offset-2" href="http://localhost:8000">`gemini-server`</a> → Settings → Credentials → reconnect cookies.
                </div>
              </div>
            )}
          </header>

          <div className="flex-1 overflow-hidden bg-muted/10">
            <ScrollArea className="h-full">
              <div className="mx-auto w-full max-w-3xl px-4 py-6 space-y-4" ref={messageListRef}>
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      data-chat-last-assistant={m.role === "assistant" && idx === messages.length - 1 ? "1" : undefined}
                      className={cn(
                        "max-w-[90%] sm:max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border",
                      )}
                    >
                      {m.content || (m.role === "assistant" && streaming ? "…" : "")}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <footer className="border-t bg-background p-3">
            <div className="mx-auto w-full max-w-3xl flex gap-3 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message… (Ctrl+Enter to send)"
                className="min-h-12 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={streaming}
              />
              <Button onClick={send} disabled={streaming || input.trim().length === 0}>
                {streaming ? "Streaming…" : "Send"}
              </Button>
            </div>
            <div className="mx-auto w-full max-w-3xl mt-2 text-xs text-muted-foreground">
              Tip: use the sidebar to resume chats. If Gemini aborts, hit Status and reconnect cookies.
            </div>
          </footer>
        </section>
      </div>
    </div>
  );
}
