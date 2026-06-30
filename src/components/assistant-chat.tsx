"use client";

import { Bot, Sparkles, User } from "lucide-react";
import { useState } from "react";
import {
  answerAssistantPrompt,
  assistantPrompts,
  type AssistantResponse,
} from "@/lib/assistant";
import { customers } from "@/lib/mock-data";
import { AppShell } from "@/components/app-shell";

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; response: AssistantResponse };

export function AssistantChat() {
  const [customerId, setCustomerId] = useState<string>(customers[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [counter, setCounter] = useState(0);

  const selectedCustomer =
    customers.find((customer) => customer.id === customerId) ?? customers[0];

  function ask(promptId: string, promptText: string) {
    const response = answerAssistantPrompt(promptId, customerId);
    setMessages((previous) => [
      ...previous,
      { id: `u-${counter}`, role: "user", text: promptText },
      { id: `a-${counter}`, role: "assistant", response },
    ]);
    setCounter((value) => value + 1);
  }

  return (
    <AppShell>
      <main className="dashboard-main">
        <section className="dashboard-title-band" aria-labelledby="assistant-title">
          <div>
            <p className="eyebrow">AI assistant</p>
            <h1 id="assistant-title">AI assistant</h1>
            <p>
              A natural-language business analyst for wholesale operations. It reasons over
              {" "}{selectedCustomer.name}&apos;s catalogue, orders, POS, inventory, and support data
              to recommend actions — not a generic chatbot.
            </p>
          </div>
          <label className="control">
            <span>Buyer context</span>
            <select
              aria-label="Buyer context"
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
        </section>

        <div className="assistant-layout">
          <section className="assistant-presets" aria-label="Preset prompts">
            <h2>Preset prompts</h2>
            <div className="preset-list">
              {assistantPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  className="preset-button"
                  onClick={() => ask(prompt.id, prompt.text)}
                >
                  {prompt.text}
                </button>
              ))}
            </div>
          </section>

          <section className="assistant-conversation" aria-label="Conversation">
            <div className="assistant-log" role="log" aria-live="polite">
              {messages.length === 0 ? (
                <div className="assistant-empty">
                  <Sparkles aria-hidden="true" size={22} />
                  <p>
                    Pick a preset prompt to see a data-grounded answer drawn from live mock business
                    data.
                  </p>
                </div>
              ) : (
                messages.map((message) =>
                  message.role === "user" ? (
                    <article className="chat-message chat-user" key={message.id}>
                      <span className="chat-avatar" aria-hidden="true">
                        <User size={16} />
                      </span>
                      <p>{message.text}</p>
                    </article>
                  ) : (
                    <article className="chat-message chat-assistant" key={message.id}>
                      <span className="chat-avatar" aria-hidden="true">
                        <Bot size={16} />
                      </span>
                      <div className="chat-bubble">
                        <strong>{message.response.headline}</strong>
                        {message.response.body.map((line, index) => (
                          <p key={`${message.id}-${index}`}>{line}</p>
                        ))}
                      </div>
                    </article>
                  ),
                )
              )}
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
