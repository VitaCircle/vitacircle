"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api";
import { AuthShell } from "@/components/auth/AuthShell";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { landingCopy } from "@/components/landing/landingCopy";
import styles from "@/components/auth/auth.module.css";

export default function LoginPage() {
  const c = landingCopy.auth.login;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await api<{ accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(r.accessToken);
      router.push("/app");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={c.title}
      subtitle={c.subtitle}
      trust={c.trust}
      headerLink={{ href: "/register", label: "Create account" }}
      footer={
        <>
          <Link href="/forgot">Forgot password</Link>
          {" · "}
          <Link href="/register">Create account</Link>
        </>
      }
    >
      <SocialAuthButtons />
      <form onSubmit={onSubmit}>
        <div className="field lg">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field lg">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        <button className="btn accent lg block" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}
