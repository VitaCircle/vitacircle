import { SiteHeader } from "@/components/layout/SiteHeader";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ padding: "48px 24px 96px", maxWidth: 720 }}>
        <h1>Privacy Policy</h1>
        <p>We process account data, portfolio content, usage analytics (views, coarse geo, device — no invasive fingerprinting), and billing identifiers. You may export or delete your account from Settings. Legal bases include contract and legitimate interests. GDPR/CCPA requests: privacy@vitacircle.app. AI scoring may send a redacted snapshot to a third-party LLM unless you disable that in Settings.</p>
      </main>
    </>
  );
}
