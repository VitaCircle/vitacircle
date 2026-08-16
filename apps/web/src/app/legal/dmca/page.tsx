import { SiteHeader } from "@/components/layout/SiteHeader";

export default function DmcaPage() {
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ padding: "48px 24px 96px", maxWidth: 720 }}>
        <h1>DMCA</h1>
        <p>Send takedown notices to dmca@vitacircle.app with the URL, description of the work, and a statement of good faith. We will unpublish matching public portfolios while we review.</p>
      </main>
    </>
  );
}
