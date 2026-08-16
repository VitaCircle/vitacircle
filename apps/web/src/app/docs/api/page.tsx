import { SiteHeader } from "@/components/layout/SiteHeader";

export default function ApiDocsPage() {
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ padding: "48px 24px 96px", maxWidth: 800 }}>
        <h1>Public API</h1>
        <p>Authenticated creators can mint keys at <code>POST /v1/keys</code>. Public read:</p>
        <pre>{`GET /v1/portfolios/:username/:slug
Authorization: Bearer vc_...  (optional for public published work)

Response: { title, vertical, snapshot }`}</pre>
        <p className="muted">Rate limits apply. Do not scrape unpublished drafts — the API never returns them.</p>
      </main>
    </>
  );
}
