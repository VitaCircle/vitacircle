"use client";

import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type AppRow = { _id: string; company: string; role: string; status: string; notes?: string };

export default function ApplicationsPage() {
  const [items, setItems] = useState<AppRow[]>([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    api<AppRow[]>("/applications").then(setItems);
  }, []);

  async function add() {
    const row = await api<AppRow>("/applications", { method: "POST", body: JSON.stringify({ company, role, status: "applied" }) });
    setItems([row, ...items]);
    setCompany("");
    setRole("");
  }

  return (
    <AppShell>
      <main style={{ padding: 32 }}>
        <h1>Application tracker</h1>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
          <input placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
          <button className="btn" onClick={add}>Log</button>
        </div>
        {items.map((i) => (
          <article key={i._id} className="card" style={{ marginBottom: 8 }}>
            <strong>{i.role}</strong> at {i.company} — {i.status}
          </article>
        ))}
      </main>
    </AppShell>
  );
}
