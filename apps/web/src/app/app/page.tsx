"use client";

import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VERTICALS, VERTICAL_LABELS, type Vertical } from "@vitacircle/shared";

type Portfolio = { _id: string; title: string; vertical: string; status: string; updatedAt?: string };

export default function AppHome() {
  const { user } = useAuth();
  const [items, setItems] = useState<Portfolio[]>([]);
  const [vertical, setVertical] = useState<Vertical>("ux_ui");
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (!user.onboarding?.completed) {
      router.replace("/onboarding");
      return;
    }
    api<Portfolio[]>("/portfolios").then(setItems);
  }, [user, router]);

  async function create() {
    const p = await api<{ _id: string }>("/portfolios", { method: "POST", body: JSON.stringify({ vertical }) });
    router.push(`/app/portfolios/${p._id}/edit`);
  }

  return (
    <AppShell>
      <main style={{ padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Portfolios</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={vertical} onChange={(e) => setVertical(e.target.value as Vertical)}>
              {VERTICALS.map((v) => (
                <option key={v} value={v}>{VERTICAL_LABELS[v]}</option>
              ))}
            </select>
            <button className="btn" onClick={create}>New portfolio</button>
          </div>
        </div>
        <div className="grid-2" style={{ marginTop: 24 }}>
          {items.map((p) => (
            <Link key={p._id} href={`/app/portfolios/${p._id}/edit`} className="card">
              <h2>{p.title}</h2>
              <p className="muted">{p.vertical} · {p.status}</p>
            </Link>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
