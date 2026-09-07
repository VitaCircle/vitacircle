"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AuthShell } from "@/components/auth/AuthShell";
import { landingCopy } from "@/components/landing/landingCopy";
import styles from "@/components/auth/auth.module.css";

export default function ForgotPage() {
  const c = landingCopy.auth.forgot;
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await api("/auth/forgot", { method: "POST", body: JSON.stringify({ email }) });
    setMsg("If that email exists, a reset link was sent (check API logs in development).");
    setLoading(false);
  }

  return (
    <AuthShell
      title={c.title}
      subtitle={c.subtitle}
      headerLink={{ href: "/login", label: "Log in" }}
      footer={<Link href="/login">Back to log in</Link>}
    >
      <form onSubmit={onSubmit}>
        <div className="field lg">
          <label htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {msg ? <p className={styles.success}>{msg}</p> : null}
        <button className="btn accent lg block" type="submit" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
