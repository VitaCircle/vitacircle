"use client";

import { useEffect, useState } from "react";
import { PortfolioRenderer } from "@/components/blocks/PortfolioRenderer";
import type { DraftTree } from "@vitacircle/shared";
import { SiteHeader } from "@/components/layout/SiteHeader";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function PublicPortfolio({ params }: { params: Promise<{ username: string; slug: string }> }) {
  const [data, setData] = useState<{ id?: string; title: string; snapshot: DraftTree; branding?: boolean; owner?: { displayName?: string } } | null>(null);
  const [err, setErr] = useState("");
  const [password, setPassword] = useState("");
  const [ids, setIds] = useState<{ username: string; slug: string } | null>(null);

  useEffect(() => {
    params.then(setIds);
  }, [params]);

  useEffect(() => {
    if (!ids) return;
    fetch(`${API}/public/${ids.username}/${ids.slug}`)
      .then(async (r) => {
        if (r.status === 401) {
          setErr("password");
          return;
        }
        if (!r.ok) throw new Error("Not found");
        setData(await r.json());
      })
      .catch(() => setErr("missing"));
  }, [ids]);

  async function unlock() {
    if (!ids) return;
    const r = await fetch(`${API}/public/${ids.username}/${ids.slug}/unlock`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!r.ok) return;
    setData(await r.json());
    setErr("");
  }

  useEffect(() => {
    if (!data || !ids) return;
    if (!data?.id) return;
    fetch(`${API}/analytics/ingest`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        portfolioId: data.id,
        type: "view",
        device: window.innerWidth < 700 ? "mobile" : "desktop",
        referrer: document.referrer,
      }),
    }).catch(() => undefined);
  }, [data, ids]);

  if (err === "password") {
    return (
      <main className="container" style={{ paddingTop: 80 }}>
        <h1>Protected portfolio</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn" onClick={unlock}>Unlock</button>
      </main>
    );
  }
  if (err) {
    return (
      <>
        <SiteHeader />
        <main className="container" style={{ paddingTop: 80 }}><h1>Portfolio not found</h1></main>
      </>
    );
  }
  if (!data) return <p className="container">Loading…</p>;
  return (
    <>
      <SiteHeader />
      <PortfolioRenderer tree={data.snapshot} branding={data.branding} />
    </>
  );
}
