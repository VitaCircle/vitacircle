"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function RecruiterPage() {
  const [portfolioId, setPortfolioId] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  async function send() {
    await fetch(`${API}/recruiter/inquiries`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ portfolioId, fromEmail, message }),
    });
    setOk(true);
  }

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ maxWidth: 560, paddingTop: 48 }}>
        <h1>Contact a creator</h1>
        <div className="field"><label>Portfolio id</label><input value={portfolioId} onChange={(e) => setPortfolioId(e.target.value)} /></div>
        <div className="field"><label>Your email</label><input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} /></div>
        <div className="field"><label>Message</label><textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
        <button className="btn" onClick={send}>Send inquiry</button>
        {ok ? <p>Sent.</p> : null}
      </main>
    </>
  );
}
