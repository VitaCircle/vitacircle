"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { api } from "@/lib/api";
import { SiteHeader } from "@/components/layout/SiteHeader";
import Link from "next/link";

function VerifyInner() {
  const params = useSearchParams();
  const [msg, setMsg] = useState("Verifying…");
  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setMsg("Missing token");
      return;
    }
    api(`/auth/verify?token=${encodeURIComponent(token)}`)
      .then(() => setMsg("Email verified. You can publish portfolios now."))
      .catch((e) => setMsg(e instanceof Error ? e.message : "Invalid token"));
  }, [params]);
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ paddingTop: 64 }}>
        <h1>Verify email</h1>
        <p>{msg}</p>
        <Link href="/login">Log in</Link>
      </main>
    </>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyInner />
    </Suspense>
  );
}
