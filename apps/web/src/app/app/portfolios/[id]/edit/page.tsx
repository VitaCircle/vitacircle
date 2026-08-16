"use client";

import { Builder } from "@/components/builder/Builder";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function EditPage() {
  const params = useParams<{ id: string }>();
  return (
    <div>
      <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--line)", display: "flex", gap: 16 }}>
        <Link href="/app">Workspace</Link>
        <Link href={`/app/portfolios/${params.id}/analytics`}>Analytics</Link>
      </div>
      <Builder portfolioId={params.id} />
    </div>
  );
}
