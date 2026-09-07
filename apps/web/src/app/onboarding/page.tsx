"use client";

import { VERTICALS, VERTICAL_LABELS, type Vertical } from "@vitacircle/shared";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import styles from "./onboarding.module.css";

export default function OnboardingPage() {
  const { refresh } = useAuth();
  const router = useRouter();
  const [vertical, setVertical] = useState<Vertical>("ux_ui");
  const [targetRole, setTargetRole] = useState("");
  const [intent, setIntent] = useState<"exploring" | "job_posting">("exploring");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          onboarding: { vertical, targetRole, intent, completed: true, experienceLevel: "student" },
        }),
      });
      await refresh();
      router.push("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
      setBusy(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <div className={styles.card}>
          <p className={styles.eyebrow}>Welcome</p>
          <h1 className={styles.title}>What are you aiming for?</h1>
          <p className={styles.lead}>
            Your creative discipline and target role set defaults for AI scoring and new portfolios.
          </p>
          <form onSubmit={save}>
            <div className="field lg">
              <label htmlFor="onboard-vertical">Creative discipline</label>
              <select
                id="onboard-vertical"
                value={vertical}
                onChange={(e) => setVertical(e.target.value as Vertical)}
              >
                {VERTICALS.map((v) => (
                  <option key={v} value={v}>{VERTICAL_LABELS[v]}</option>
                ))}
              </select>
            </div>
            <div className="field lg">
              <label htmlFor="onboard-role">Target role</label>
              <input
                id="onboard-role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Product designer intern"
                required
              />
            </div>
            <div className="field lg">
              <label htmlFor="onboard-intent">Intent</label>
              <select
                id="onboard-intent"
                value={intent}
                onChange={(e) => setIntent(e.target.value as "exploring" | "job_posting")}
              >
                <option value="exploring">I am exploring</option>
                <option value="job_posting">I have a job posting</option>
              </select>
            </div>
            {error ? <p className={styles.error}>{error}</p> : null}
            <button className="btn accent lg block" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Continue to workspace"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
