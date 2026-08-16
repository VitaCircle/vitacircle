"use client";

import { FormEvent, useState } from "react";
import { api, setToken } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const r = await api<{ accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(r.accessToken);
      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ maxWidth: 440, paddingTop: 64 }}>
        <h1>Log in</h1>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error ? <p style={{ color: "var(--danger)" }}>{error}</p> : null}
          <button className="btn" type="submit">Continue</button>
        </form>
        <p className="muted" style={{ marginTop: 16 }}>
          <Link href="/forgot">Forgot password</Link> · <Link href="/register">Create account</Link>
        </p>
        <p className="muted">
          <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/auth/google`}>Continue with Google</a>
          {" · "}
          <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/auth/linkedin`}>LinkedIn</a>
        </p>
      </main>
    </>
  );
}
