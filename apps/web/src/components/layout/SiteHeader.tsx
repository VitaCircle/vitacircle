"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { user, logout } = useAuth();
  return (
    <header className="container">
      <nav className="nav">
        <Link href="/" className="display" style={{ fontSize: 22 }}>
          VitaCircle
        </Link>
        <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 14 }}>
          <Link href="/talent">Talent</Link>
          <Link href="/docs/api">API</Link>
          {user ? (
            <>
              <Link href="/app">Workspace</Link>
              <button className="btn ghost" onClick={() => logout()}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/register" className="btn">
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
