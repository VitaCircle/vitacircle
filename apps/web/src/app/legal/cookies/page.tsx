import { SiteHeader } from "@/components/layout/SiteHeader";

export default function CookiesPage() {
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ padding: "48px 24px 96px", maxWidth: 720 }}>
        <h1>Cookies</h1>
        <p>Essential cookies keep you signed in (HttpOnly refresh token). We do not use advertising trackers. Analytics on public pages records views without storing a persistent advertising ID.</p>
      </main>
    </>
  );
}
