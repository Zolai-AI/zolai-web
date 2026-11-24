"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAIModels } from "@/features/zolai/hooks/useAIModels";
import { streamChat } from "@/features/zolai/lib/stream";
import type { ChatMessage as ChatMsg } from "@/features/zolai/api/chat";

const DEFAULT_MODEL = "gemini-3-flash";

function appendAssistantDelta(setter: React.Dispatch<React.SetStateAction<ChatMsg[]>>, delta: string) {
  setter((prev) => {
    const next = [...prev];
    const lastIdx = next.length - 1;
    if (lastIdx >= 0 && next[lastIdx].role === "assistant") {
      next[lastIdx] = { ...next[lastIdx], content: next[lastIdx].content + delta };
    }
    return next;
  });
}

function setAssistantContent(setter: React.Dispatch<React.SetStateAction<ChatMsg[]>>, content: string) {
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

export function ChatPanel() {
  const [messages, setMessages] = React.useState<ChatMsg[]>([
    { role: "assistant", content: "Kum. What do you want to practice (Tedim)?" },
  ]);
  const [input, setInput] = React.useState("");
  const [model, setModel] = React.useState<string>(DEFAULT_MODEL);

  // Models come from the typed transport + react-query (endpoint is optional
  // in some deployments — on failure we keep the current/default model only).
  const modelsQuery = useAIModels();
  const models = React.useMemo(() => modelsQuery.data ?? [], [modelsQuery.data]);

  React.useEffect(() => {
    if (models.length > 0) setModel((prev) => (models.includes(prev) ? prev : models[0]));
  }, [models]);

  // SSE streaming goes through the transport module inside a useMutation, so
  // pending/error state is owned by react-query.
  const sendMutation = useMutation({
    mutationFn: (vars: { history: ChatMsg[]; text: string }) =>
      streamChat(
        {
          // Zolai Toolkit expects messages with role/content
          messages: [...vars.history, { role: "user", content: vars.text }],
          model,
        },
        { onDelta: (delta) => appendAssistantDelta(setMessages, delta) },
      ),
  });
  const isStreaming = sendMutation.isPending;

  const send = React.useCallback(() => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput("");
    sendMutation.mutate({ history: messages, text });
    setMessages((prev) => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);
  }, [input, isStreaming, messages, sendMutation]);

  React.useEffect(() => {
    if (sendMutation.isError) {
      setAssistantContent(setMessages, `Error: ${sendMutation.error.message}`);
    }
  }, [sendMutation.isError, sendMutation.error]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <CardTitle>AI Chat (local gemini-server)</CardTitle>
          <CardDescription>
            Website → `/api/zolai/chat/stream` → `gemini-server`
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3 overflow-auto py-4">
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">Model</div>
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={isStreaming}
            >
              {(models.length > 0 ? models : [model]).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <div className="text-xs text-muted-foreground">Send: Ctrl+Enter</div>
          </div>
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[80%] rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm whitespace-pre-wrap"
                  : "mr-auto max-w-[80%] rounded-lg border bg-card px-3 py-2 text-sm whitespace-pre-wrap"
              }
            >
              {m.content || (m.role === "assistant" && isStreaming ? "…" : "")}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4 flex gap-3 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type in Zolai/Tedim…"
            className="min-h-12"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button onClick={send} disabled={isStreaming || input.trim().length === 0}>
            {isStreaming ? "Streaming…" : "Send"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
