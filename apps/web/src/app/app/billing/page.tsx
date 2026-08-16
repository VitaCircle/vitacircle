"use client";

import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { entitlementsFor, type PlanId } from "@vitacircle/shared";

export default function BillingPage() {
  const { user, refresh } = useAuth();
  const plan = (user?.plan as PlanId) || "free";
  const e = entitlementsFor(plan === "studio" || plan === "pro" ? plan : "free");

  async function checkout() {
    const r = await api<{ url?: string | null; mocked?: boolean }>("/billing/checkout", { method: "POST", body: JSON.stringify({ interval: "month" }) });
    if (r.url) window.location.href = r.url;
    else {
      await refresh();
      alert("Pro enabled in development (no Stripe keys).");
    }
  }

  return (
    <AppShell>
      <main style={{ padding: 32 }}>
        <h1>Billing</h1>
        <p>Current plan: <strong>{plan}</strong></p>
        <ul className="muted">
          <li>Portfolios: {e.maxPortfolios}</li>
          <li>Storage: {Math.round(e.storageBytes / 1024 / 1024)} MB</li>
          <li>AI scores / month: {e.unlimitedAi ? "unlimited" : e.aiScoresPerMonth}</li>
          <li>Video / custom domain / ATS: {e.video ? "yes" : "no"}</li>
        </ul>
        {plan === "free" ? <button className="btn accent" onClick={checkout}>Upgrade to Pro ($12–16/mo)</button> : null}
      </main>
    </AppShell>
  );
}
