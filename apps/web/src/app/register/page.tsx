"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AuthShell } from "@/components/auth/AuthShell";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { landingCopy } from "@/components/landing/landingCopy";
import styles from "@/components/auth/auth.module.css";

export default function RegisterPage() {
  const c = landingCopy.auth.register;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, username: username || undefined }),
      });
      setMsg("Account created. Check your email for verification, then log in.");
      setTimeout(() => router.push("/login"), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={c.title}
      subtitle={c.subtitle}
      trust={c.trust}
      headerLink={{ href: "/login", label: "Log in" }}
      footer={<Link href="/login">Already have an account? Log in</Link>}
    >
      <SocialAuthButtons />
      <p className={styles.legalNote}>
        You must be 16 or older. By continuing you accept the{" "}
        <Link href="/legal/terms">Terms</Link> and <Link href="/legal/privacy">Privacy Policy</Link>.
      </p>
      <form onSubmit={onSubmit}>
        <div className="field lg">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field lg">
          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="optional"
          />
        </div>
        <div className="field lg">
          <label htmlFor="register-password">Password (8+ characters)</label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        {msg ? <p className={styles.success}>{msg}</p> : null}
        <button className="btn accent lg block" type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
