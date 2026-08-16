"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  if (loading) return <p className="container">Loading…</p>;
  if (!user) {
    return (
      <main className="container" style={{ paddingTop: 64 }}>
        <p>Please <Link href="/login">log in</Link>.</p>
      </main>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "100vh" }}>
      <aside style={{ borderRight: "1px solid var(--line)", padding: 20 }}>
        <Link href="/" className="display" style={{ fontSize: 20 }}>VitaCircle</Link>
        <nav style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24, fontSize: 14 }}>
          <Link href="/app">Portfolios</Link>
          <Link href="/app/media">Media</Link>
          <Link href="/app/import">Import</Link>
          <Link href="/app/applications">Applications</Link>
          <Link href="/app/billing">Billing</Link>
          <Link href="/app/settings">Settings</Link>
          <Link href="/app/org">Organization</Link>
          {user.role === "admin" ? <Link href="/app/admin">Admin</Link> : null}
          <button className="btn ghost" onClick={() => logout()}>Log out</button>
        </nav>
        <p className="muted" style={{ marginTop: 24, fontSize: 12 }}>{user.plan.toUpperCase()} · {user.username}</p>
      </aside>
      <div>{children}</div>
    </div>
  );
}
