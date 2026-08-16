"use client";

import { VERTICALS, VERTICAL_LABELS, type Vertical } from "@vitacircle/shared";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function OnboardingPage() {
  const { refresh } = useAuth();
  const router = useRouter();
  const [vertical, setVertical] = useState<Vertical>("ux_ui");
  const [targetRole, setTargetRole] = useState("");
  const [intent, setIntent] = useState<"exploring" | "job_posting">("exploring");

  async function save() {
    await api("/users/me", {
      method: "PATCH",
      body: JSON.stringify({ onboarding: { vertical, targetRole, intent, completed: true, experienceLevel: "student" } }),
    });
    await refresh();
    router.push("/app");
  }

  return (
    <>
      <SiteHeader />
      <main className="container" style={{ maxWidth: 560, paddingTop: 48 }}>
        <h1>What are you aiming for?</h1>
        <div className="field">
          <label>Creative vertical</label>
          <select value={vertical} onChange={(e) => setVertical(e.target.value as Vertical)}>
            {VERTICALS.map((v) => <option key={v} value={v}>{VERTICAL_LABELS[v]}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Target role</label>
          <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Product designer intern" />
        </div>
        <div className="field">
          <label>Intent</label>
          <select value={intent} onChange={(e) => setIntent(e.target.value as "exploring" | "job_posting")}>
            <option value="exploring">I am exploring</option>
            <option value="job_posting">I have a job posting</option>
          </select>
        </div>
        <button className="btn" onClick={save}>Continue to workspace</button>
      </main>
    </>
  );
}
