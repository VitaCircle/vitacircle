import type { Block, DraftTree, ThemeTokens } from "@vitacircle/shared";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function assetUrl(id?: string) {
  if (!id) return "";
  if (id.startsWith("http")) return id;
  return `${API}/assets/raw?key=${encodeURIComponent(id)}`;
}

export function BlockView({ block }: { block: Block }) {
  const d = block.data as Record<string, unknown>;
  switch (block.type) {
    case "hero":
      return (
        <section style={{ padding: "48px 0" }}>
          <p className="muted" style={{ letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 12 }}>
            {(d.availability as string) || "Open to work"}
          </p>
          <h1 className="display" style={{ fontSize: 48, margin: "8px 0" }}>
            {(d.name as string) || "Your name"}
          </h1>
          <p style={{ fontSize: 20, maxWidth: 640 }}>{(d.headline as string) || "Headline for the role you want"}</p>
          {d.location ? <p className="muted">{d.location as string}</p> : null}
        </section>
      );
    case "about":
      return (
        <section style={{ padding: "24px 0" }}>
          <h2>About</h2>
          <p style={{ maxWidth: 720, whiteSpace: "pre-wrap" }}>{(d.body as string) || "A short narrative about your craft."}</p>
        </section>
      );
    case "project": {
      const media = (d.media as { assetId: string; alt?: string; caption?: string }[]) || [];
      return (
        <section style={{ padding: "24px 0", borderTop: "1px solid var(--line)" }}>
          <h2>{(d.title as string) || "Project"}</h2>
          <p><strong>Problem.</strong> {(d.problem as string) || "—"}</p>
          <p><strong>Role.</strong> {(d.role as string) || "—"}</p>
          <p><strong>Outcome.</strong> {(d.outcome as string) || "—"}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 16 }}>
            {media.map((m) => (
              <figure key={m.assetId} style={{ margin: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={assetUrl(m.assetId)} alt={m.alt || ""} style={{ width: "100%", borderRadius: 4 }} />
                {m.caption ? <figcaption className="muted">{m.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        </section>
      );
    }
    case "gallery": {
      const media = (d.media as { assetId: string; alt?: string }[]) || [];
      return (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, padding: "24px 0" }}>
          {media.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.assetId} src={assetUrl(m.assetId)} alt={m.alt || ""} style={{ width: "100%" }} />
          ))}
        </section>
      );
    }
    case "audio":
      return (
        <section style={{ padding: "24px 0" }}>
          <h2>{(d.title as string) || "Audio"}</h2>
          {d.assetId ? <audio controls src={assetUrl(d.assetId as string)} style={{ width: "100%" }} /> : <p className="muted">No audio yet</p>}
          {d.captions ? <p>{d.captions as string}</p> : null}
        </section>
      );
    case "video":
      return (
        <section style={{ padding: "24px 0" }}>
          <h2>{(d.title as string) || "Video"}</h2>
          {d.assetId ? <video controls src={assetUrl(d.assetId as string)} style={{ width: "100%", maxHeight: 480 }} /> : <p className="muted">No video yet</p>}
        </section>
      );
    case "skills":
      return (
        <section style={{ padding: "24px 0" }}>
          <h2>Skills</h2>
          <p>{((d.items as string[]) || []).join(" · ")}</p>
        </section>
      );
    case "experience":
      return (
        <section style={{ padding: "24px 0" }}>
          <h2>Experience</h2>
          {((d.items as { id: string; org: string; role: string; summary: string }[]) || []).map((i) => (
            <div key={i.id} style={{ marginBottom: 12 }}>
              <strong>{i.role}</strong> — {i.org}
              <p className="muted">{i.summary}</p>
            </div>
          ))}
        </section>
      );
    case "education":
      return (
        <section style={{ padding: "24px 0" }}>
          <h2>Education</h2>
          {((d.items as { id: string; school: string; credential: string }[]) || []).map((i) => (
            <p key={i.id}>{i.credential} — {i.school}</p>
          ))}
        </section>
      );
    case "contact":
      return (
        <section style={{ padding: "24px 0" }}>
          <h2>Contact</h2>
          <p>{(d.email as string) || ""}</p>
          <p>{(d.website as string) || ""}</p>
        </section>
      );
    case "testimonials":
      return (
        <section style={{ padding: "24px 0" }}>
          <h2>Testimonials</h2>
          {((d.items as { id: string; quote: string; name: string }[]) || []).map((i) => (
            <blockquote key={i.id}>
              <p>{i.quote}</p>
              <cite>{i.name}</cite>
            </blockquote>
          ))}
        </section>
      );
    case "awards":
      return (
        <section style={{ padding: "24px 0" }}>
          <h2>Awards</h2>
          {((d.items as { id: string; title: string; issuer?: string }[]) || []).map((i) => (
            <p key={i.id}>{i.title}{i.issuer ? ` — ${i.issuer}` : ""}</p>
          ))}
        </section>
      );
    case "embed":
      return (
        <section style={{ padding: "24px 0" }}>
          <h2>{(d.title as string) || "Embed"}</h2>
          <p className="muted">{(d.url as string) || ""}</p>
        </section>
      );
    default:
      return null;
  }
}

export function PortfolioRenderer({
  tree,
  branding,
}: {
  tree: DraftTree;
  branding?: boolean;
}) {
  const theme = tree.theme as ThemeTokens | undefined;
  return (
    <div
      style={{
        background: theme?.colorBg || "var(--bg)",
        color: theme?.colorInk || "var(--ink)",
        ["--accent" as string]: theme?.colorAccent || "#C45C26",
        minHeight: "100%",
        padding: "0 24px 64px",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {tree.blocks.map((b) => (
          <BlockView key={b.id} block={b} />
        ))}
        {branding ? (
          <p className="muted" style={{ marginTop: 48, fontSize: 13 }}>
            Built with VitaCircle
          </p>
        ) : null}
      </div>
    </div>
  );
}
