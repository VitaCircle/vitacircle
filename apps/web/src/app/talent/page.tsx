"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function TalentPage() {
  const [data, setData] = useState<{ people: { username: string; displayName?: string }[]; portfolios: { publishedSlug?: string; title: string; vertical: string }[] } | null>(null);
  useEffect(() => {
    fetch(`${API}/talent/search`).then((r) => r.json()).then(setData);
  }, []);
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ padding: "48px 24px" }}>
        <h1>Talent directory</h1>
        <p className="muted">Opt-in public profiles only.</p>
        <div className="grid-2">
          {data?.portfolios.map((p) => (
            <Link key={p.publishedSlug} href={`/${p.publishedSlug || ""}`} className="card">
              <h2>{p.title}</h2>
              <p className="muted">{p.vertical}</p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
