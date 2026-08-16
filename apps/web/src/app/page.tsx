import { SiteHeader } from "@/components/layout/SiteHeader";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ padding: "72px 24px 96px" }}>
        <p className="muted" style={{ letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 12 }}>
          For students, new grads, and working creatives
        </p>
        <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 72px)", maxWidth: 820, margin: "12px 0 20px" }}>
          A portfolio you can tailor to the role — then prove it.
        </h1>
        <p style={{ fontSize: 20, maxWidth: 640, color: "var(--muted)" }}>
          VitaCircle is the operating system for creative job seekers: drag-and-drop case studies, audio and image,
          an AI role-fit score, a live URL, and PDF/Word export.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <Link href="/register" className="btn">
            Create your first portfolio
          </Link>
          <Link href="/talent" className="btn ghost">
            Browse talent
          </Link>
        </div>
        <div className="grid-2" style={{ marginTop: 72 }}>
          {[
            ["Role-fit AI", "A 0–100 score with a visible rubric: relevance, evidence, craft, completeness, clarity."],
            ["Media first", "PNG, JPEG, MP3 now; video on Pro. Recruiters can play the work, not imagine it."],
            ["Share or export", "Publish username.vitacircle.app/slug or download PDF and Word in one click."],
            ["Career OS", "Application tracker, ATS resume, custom domain, education seats — when you need them."],
          ].map(([t, b]) => (
            <article key={t} className="card">
              <h2>{t}</h2>
              <p className="muted">{b}</p>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
