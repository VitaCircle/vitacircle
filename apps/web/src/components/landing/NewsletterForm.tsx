"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

type NewsletterFormProps = {
  source?: string;
  placeholder?: string;
  submitLabel?: string;
  successMessage?: string;
  className?: string;
  inline?: boolean;
};

export function NewsletterForm({
  source = "website",
  placeholder = "Your email address",
  submitLabel = "Subscribe",
  successMessage = "You're subscribed!",
  className,
  inline = false,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMsg("");
    setLoading(true);
    try {
      await api("/platform/newsletter", {
        method: "POST",
        body: JSON.stringify({ email, source }),
      });
      setMsg(successMessage);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not subscribe");
    } finally {
      setLoading(false);
    }
  }

  if (inline) {
    return (
      <form onSubmit={onSubmit} className={className} style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          aria-label="Email for newsletter"
          style={{
            flex: "1 1 200px",
            minHeight: "var(--control-height-lg)",
            padding: "14px 18px",
            fontSize: "var(--control-font-lg)",
            border: "1px solid rgba(255, 255, 255, 0.35)",
            borderRadius: "var(--radius)",
            background: "rgba(255, 255, 255, 0.12)",
            color: "#fff",
          }}
        />
        <button className="btn accent lg" type="submit" disabled={loading}>
          {submitLabel}
        </button>
        {msg ? <span style={{ color: "#9fd8d4", fontSize: 15, width: "100%" }}>{msg}</span> : null}
        {error ? <span style={{ color: "#f5a8a0", fontSize: 15, width: "100%" }}>{error}</span> : null}
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      <div className="field lg">
        <label htmlFor={`newsletter-${source}`}>Email</label>
        <input
          id={`newsletter-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      {error ? <p style={{ color: "var(--danger)", margin: "0 0 12px" }}>{error}</p> : null}
      {msg ? <p style={{ color: "var(--ok)", margin: "0 0 12px" }}>{msg}</p> : null}
      <button className="btn accent lg block" type="submit" disabled={loading}>
        {submitLabel}
      </button>
    </form>
  );
}
