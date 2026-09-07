"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { AuthShell } from "@/components/auth/AuthShell";
import { landingCopy } from "@/components/landing/landingCopy";

function ResetInner() {
  const c = landingCopy.auth.reset;
  const params = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await api("/auth/reset", {
      method: "POST",
      body: JSON.stringify({ token: params.get("token"), password }),
    });
    router.push("/login");
  }

  return (
    <AuthShell
      title={c.title}
      subtitle={c.subtitle}
      headerLink={{ href: "/login", label: "Log in" }}
      footer={<Link href="/login">Back to log in</Link>}
    >
      <form onSubmit={onSubmit}>
        <div className="field lg">
          <label htmlFor="reset-password">New password</label>
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn accent lg block" type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save password"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function ResetPage() {
  return (
    <Suspense>
      <ResetInner />
    </Suspense>
  );
}
