"use client";

import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  async function save() {
    await api("/users/me", {
      method: "PATCH",
      body: JSON.stringify({
        displayName,
        consents: { talentDirectory: (document.getElementById("talent") as HTMLInputElement)?.checked, doNotSendToLlm: (document.getElementById("nolm") as HTMLInputElement)?.checked },
      }),
    });
    await refresh();
  }

  async function exportData() {
    const data = await api("/users/me/export");
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vitacircle-export.json";
    a.click();
  }

  async function destroy() {
    if (!confirm("Delete your account and all portfolios?")) return;
    await api("/users/me", { method: "DELETE" });
    window.location.href = "/";
  }

  return (
    <AppShell>
      <main style={{ padding: 32, maxWidth: 560 }}>
        <h1>Settings</h1>
        <div className="field"><label>Display name</label><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
        <label><input id="talent" type="checkbox" /> Appear in public talent directory</label>
        <br />
        <label><input id="nolm" type="checkbox" /> Do not send content to third-party LLMs</label>
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn" onClick={save}>Save</button>
          <button className="btn ghost" onClick={exportData}>Download my data</button>
          <button className="btn ghost" onClick={destroy}>Delete account</button>
        </div>
      </main>
    </AppShell>
  );
}
