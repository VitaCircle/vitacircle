"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { SiteHeader } from "@/components/layout/SiteHeader";

function ResetInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await api("/auth/reset", { method: "POST", body: JSON.stringify({ token: params.get("token"), password }) });
    router.push("/login");
  }
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ maxWidth: 440, paddingTop: 64 }}>
        <h1>Choose a new password</h1>
        <form onSubmit={onSubmit}>
          <div className="field"><label>Password</label><input type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <button className="btn">Save</button>
        </form>
      </main>
    </>
  );
}

export default function ResetPage() {
  return (
    <Suspense>
      <ResetInner />
    </Suspense>
  );
}
