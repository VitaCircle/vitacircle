"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await api("/auth/forgot", { method: "POST", body: JSON.stringify({ email }) });
    setMsg("If that email exists, a reset link was sent (check API logs in development).");
  }
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ maxWidth: 440, paddingTop: 64 }}>
        <h1>Reset password</h1>
        <form onSubmit={onSubmit}>
          <div className="field"><label>Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <button className="btn">Send link</button>
        </form>
        {msg ? <p>{msg}</p> : null}
      </main>
    </>
  );
}
