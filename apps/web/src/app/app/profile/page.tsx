"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { VERTICALS, VERTICAL_LABELS, type Vertical } from "@vitacircle/shared";
import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [vertical, setVertical] = useState<Vertical>("ux_ui");
  const [talentDirectory, setTalentDirectory] = useState(false);
  const [doNotSendToLlm, setDoNotSendToLlm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName || "");
    setUsername(user.username || "");
    setTargetRole(user.onboarding?.targetRole || "");
    const v = user.onboarding?.vertical as Vertical | undefined;
    if (v && VERTICALS.includes(v)) setVertical(v);
    setTalentDirectory(!!user.consents?.talentDirectory);
    setDoNotSendToLlm(!!user.consents?.doNotSendToLlm);
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          displayName,
          username: username.trim().toLowerCase(),
          onboarding: {
            ...(user?.onboarding || {}),
            targetRole,
            vertical,
            completed: true,
          },
          consents: {
            talentDirectory,
            doNotSendToLlm,
          },
        }),
      });
      await refresh();
      setToast("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <main className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Account</p>
            <h1 className={styles.title}>User profile</h1>
            <p className={styles.lead}>
              Name, username, target role, and creative discipline feed AI scoring and your workspace defaults.
            </p>
          </div>
          <Link href="/app/settings" className="btn secondary">
            Account settings
          </Link>
        </header>

        <form className={styles.card} onSubmit={onSave}>
          <div className={styles.grid}>
            <div className="field">
              <label htmlFor="profile-name">Display name</label>
              <input
                id="profile-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="profile-username">Username</label>
              <input
                id="profile-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="public-slug"
                pattern="[a-zA-Z0-9_-]{3,32}"
                title="3–32 letters, numbers, underscore, or hyphen"
                required
              />
              <span className={styles.hint}>Used in public portfolio URLs: /{username || "you"}/…</span>
            </div>
            <div className="field">
              <label htmlFor="profile-role">Target role</label>
              <input
                id="profile-role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Product designer intern"
              />
              <span className={styles.hint}>Default context for AI role-fit scoring.</span>
            </div>
            <div className="field">
              <label htmlFor="profile-vertical">Creative discipline</label>
              <select
                id="profile-vertical"
                value={vertical}
                onChange={(e) => setVertical(e.target.value as Vertical)}
              >
                {VERTICALS.map((v) => (
                  <option key={v} value={v}>{VERTICAL_LABELS[v]}</option>
                ))}
              </select>
            </div>
          </div>

          <fieldset className={styles.privacy}>
            <legend>Privacy</legend>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={talentDirectory}
                onChange={(e) => setTalentDirectory(e.target.checked)}
              />
              Appear in the public talent directory
            </label>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={doNotSendToLlm}
                onChange={(e) => setDoNotSendToLlm(e.target.checked)}
              />
              Do not send content to third-party LLMs
            </label>
          </fieldset>

          {user?.email ? (
            <p className={styles.meta}>
              Signed in as <strong>{user.email}</strong>
              {user.emailVerified ? " · Email verified" : " · Email not verified"}
              {" · "}
              {user.plan.toUpperCase()} plan
            </p>
          ) : null}

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <button className="btn accent" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save profile"}
            </button>
            <Link href="/app" className="btn ghost">
              Back to dashboard
            </Link>
          </div>
        </form>

        {toast ? <div className="toast" role="status">{toast}</div> : null}
      </main>
    </AppShell>
  );
}
