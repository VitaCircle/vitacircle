"use client";

import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { useState } from "react";

export default function OrgPage() {
  const [name, setName] = useState("");
  const [org, setOrg] = useState<unknown>(null);
  const [email, setEmail] = useState("");

  async function load() {
    setOrg(await api("/orgs/mine"));
  }

  async function create() {
    setOrg(await api("/orgs", { method: "POST", body: JSON.stringify({ name, seats: 25 }) }));
  }

  async function invite() {
    await api("/orgs/invite", { method: "POST", body: JSON.stringify({ email }) });
    alert("Invite created — token is in the API response/logs.");
  }

  return (
    <AppShell>
      <main style={{ padding: 32, maxWidth: 560 }}>
        <h1>Education / Studio org</h1>
        <p className="muted">Seats, SSO config, and branded templates. Org admins cannot read student drafts unless shared.</p>
        <button className="btn ghost" onClick={load}>Load my org</button>
        <div className="field" style={{ marginTop: 16 }}><label>New org name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <button className="btn" onClick={create}>Create org</button>
        <div className="field" style={{ marginTop: 24 }}><label>Invite email</label><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <button className="btn ghost" onClick={invite}>Invite seat</button>
        <pre>{JSON.stringify(org, null, 2)}</pre>
      </main>
    </AppShell>
  );
}
