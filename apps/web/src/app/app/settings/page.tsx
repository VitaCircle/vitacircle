"use client";

import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useState } from "react";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const { user } = useAuth();
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState("");

  async function exportData() {
    setBusy("export");
    try {
      const data = await api("/users/me/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vitacircle-export.json";
      a.click();
      setToast("Data download started.");
    } finally {
      setBusy("");
    }
  }

  async function destroy() {
    if (!confirm("Delete your account and all portfolios?")) return;
    setBusy("delete");
    try {
      await api("/users/me", { method: "DELETE" });
      window.location.href = "/";
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Delete failed");
      setBusy("");
    }
  }

  return (
    <AppShell>
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Account</p>
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.lead}>
              Data export and account deletion. Update name, role, and privacy on your{" "}
              <Link href="/app/profile">profile</Link>.
            </p>
          </div>
        </header>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Account</h2>
          <p className="muted">
            {user?.email} · @{user?.username} · {user?.plan?.toUpperCase()} plan
          </p>
          <div className={styles.actions}>
            <Link href="/app/profile" className="btn accent">
              Edit profile
            </Link>
            <button className="btn secondary" onClick={exportData} disabled={busy === "export"}>
              {busy === "export" ? "Preparing…" : "Download my data"}
            </button>
          </div>
        </section>

        <section className={`${styles.card} ${styles.dangerZone}`}>
          <h2 className={styles.sectionTitle}>Danger zone</h2>
          <p className="muted">Permanently delete your account, portfolios, and uploaded media.</p>
          <button className="btn danger" onClick={destroy} disabled={busy === "delete"}>
            {busy === "delete" ? "Deleting…" : "Delete account"}
          </button>
        </section>

        {toast ? <div className="toast" role="status">{toast}</div> : null}
      </main>
    </AppShell>
  );
}
