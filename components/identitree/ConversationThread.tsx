"use client";

import { Avatar, Button, Card, CardBody, CardHeader, Textarea } from "@heroui/react";
import type { ReactNode } from "react";

type ConversationMessage = {
  role: "guide" | "you";
  text: string;
};

type ConversationThreadProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  statusEyebrow?: string;
  statusText?: string;
  messages: ConversationMessage[];
  suggestions: string[];
  suggestionLabel: string;
  onSuggestionPress: (value: string) => void;
  draft: string;
  onDraftChange: (value: string) => void;
  placeholder: string;
  onSend: () => void;
  sendLabel: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  extra?: ReactNode;
};

export function ConversationThread({
  eyebrow,
  title,
  subtitle,
  statusEyebrow,
  statusText,
  messages,
  suggestions,
  suggestionLabel,
  onSuggestionPress,
  draft,
  onDraftChange,
  placeholder,
  onSend,
  sendLabel,
  secondaryActionLabel,
  onSecondaryAction,
  extra,
}: ConversationThreadProps) {
  return (
    <Card className="border border-zinc-800/10 bg-[#fbf6ee] shadow-[0_12px_30px_rgba(71,52,35,0.08)]">
      <CardHeader className="flex-col items-start gap-4 border-b border-zinc-800/8 pb-4">
        <div className="flex items-start gap-3">
          <Avatar
            name="G"
            classNames={{
              base: "h-11 w-11 bg-zinc-900 text-white",
              name: "text-sm tracking-[0.06em]",
            }}
          />
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{eyebrow}</p>
            <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl leading-none text-zinc-900">
              {title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">{subtitle}</p>
          </div>
        </div>
        {(statusEyebrow || statusText) && (
          <div className="w-full rounded-3xl border border-zinc-800/10 bg-[#f5ecde] px-4 py-3 text-sm text-zinc-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            {statusEyebrow && (
              <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{statusEyebrow}</p>
            )}
            {statusText && <p className="mt-1 leading-relaxed">{statusText}</p>}
          </div>
        )}
      </CardHeader>
      <CardBody className="gap-4 p-4">
        <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-[28px] border border-zinc-800/8 bg-[#f7f0e4] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`flex ${message.role === "guide" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[88%] ${message.role === "guide" ? "mr-10" : "ml-10"}`}>
                <div className="mb-1 px-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                  {message.role === "guide" ? "guide" : "you"}
                </div>
                <div
                  className={`rounded-[24px] border px-4 py-3 text-sm leading-relaxed ${
                    message.role === "guide"
                      ? "rounded-tl-md border-zinc-800/10 bg-[#fdf8f1] text-zinc-700"
                      : "rounded-tr-md border-zinc-900/10 bg-zinc-900 text-zinc-100"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {extra}

        {suggestions.length > 0 && (
          <div className="space-y-3 rounded-[28px] border border-zinc-800/8 bg-[#f7f0e4] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{suggestionLabel}</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  size="sm"
                  variant="flat"
                  className="border border-zinc-800/10 bg-[#fdf8f1] text-zinc-700"
                  onPress={() => onSuggestionPress(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-[28px] border border-zinc-800/8 bg-[#f7f0e4] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.58)]">
          <Textarea
            value={draft}
            onValueChange={onDraftChange}
            minRows={4}
            maxRows={7}
            classNames={{
              inputWrapper:
                "bg-[#fdf8f1] border border-zinc-800/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
              input: "text-sm leading-relaxed text-zinc-800",
            }}
            placeholder={placeholder}
          />
          <div className="mt-4 flex items-center justify-between gap-2">
            <div>{secondaryActionLabel && onSecondaryAction ? <Button variant="flat" size="sm" onPress={onSecondaryAction}>{secondaryActionLabel}</Button> : null}</div>
            <Button color="warning" size="sm" onPress={onSend}>
              {sendLabel}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
