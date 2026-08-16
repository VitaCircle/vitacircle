import { SiteHeader } from "@/components/layout/SiteHeader";

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ padding: "48px 24px 96px", maxWidth: 720 }}>
        <h1>Terms of Service</h1>
        <p>VitaCircle hosts portfolios you create. You retain ownership of your content. You grant us a limited license to host, display, and export that content to provide the service. We do not train foundation models on your work unless you opt in. You must be 16 or older. Do not upload content you do not have rights to. We may unpublish material that violates these terms, copyright (DMCA), or applicable law.</p>
      </main>
    </>
  );
}
