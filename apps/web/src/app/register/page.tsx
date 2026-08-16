"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/auth/register", { method: "POST", body: JSON.stringify({ email, password, username: username || undefined }) });
      setMsg("Account created. Check the API console for your verification link (dev email), then log in.");
      setTimeout(() => router.push("/login"), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ maxWidth: 440, paddingTop: 64 }}>
        <h1>Create account</h1>
        <p className="muted">You must be 16 or older. By continuing you accept the Terms and Privacy Policy.</p>
        <form onSubmit={onSubmit}>
          <div className="field"><label>Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="field"><label>Username</label><input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="optional" /></div>
          <div className="field"><label>Password (8+)</label><input type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          {error ? <p style={{ color: "var(--danger)" }}>{error}</p> : null}
          {msg ? <p>{msg}</p> : null}
          <button className="btn" type="submit">Start</button>
        </form>
        <p className="muted"><Link href="/login">Already have an account</Link></p>
      </main>
    </>
  );
}
