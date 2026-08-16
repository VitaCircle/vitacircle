"use client";

import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AnalyticsPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<unknown>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    api(`/analytics/${params.id}`).then(setData).catch((e) => setErr(e instanceof Error ? e.message : "Error"));
  }, [params.id]);
  return (
    <AppShell>
      <main style={{ padding: 32 }}>
        <h1>Analytics</h1>
        {err ? <p>{err}</p> : <pre>{JSON.stringify(data, null, 2)}</pre>}
      </main>
    </AppShell>
  );
}
