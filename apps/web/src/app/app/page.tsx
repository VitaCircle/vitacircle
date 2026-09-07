"use client";

import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  READINESS_REQUIREMENTS,
  VERTICALS,
  VERTICAL_LABELS,
  type DraftTree,
  type Vertical,
} from "@vitacircle/shared";
import styles from "./dashboard.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Portfolio = {
  _id: string;
  title: string;
  vertical: Vertical;
  status: string;
  targetRole?: string;
  publishedSlug?: string;
  updatedAt?: string;
  draft?: DraftTree;
};

type Asset = { id: string };
type Application = { _id: string; status: string };

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 1;
}

function portfolioReadiness(portfolio: Portfolio | undefined, emailVerified: boolean) {
  const blocks = portfolio?.draft?.blocks || [];
  const hero = blocks.find((b) => b.type === "hero");
  const project = blocks.find((b) => b.type === "project");
  const skills = blocks.find((b) => b.type === "skills");
  const contact = blocks.find((b) => b.type === "contact");
  const checks: Record<string, boolean> = {
    "target-role": hasText(portfolio?.targetRole),
    intro: hasText(hero?.data?.name) && hasText(hero?.data?.headline),
    project: hasText(project?.data?.title) && hasText(project?.data?.outcome),
    skills: Array.isArray(skills?.data?.items) && skills.data.items.length > 0,
    contact: hasText(contact?.data?.email) || hasText(contact?.data?.website) || hasText(contact?.data?.linkedin),
    email: emailVerified,
  };
  const done = Object.values(checks).filter(Boolean).length;
  return { checks, done, total: READINESS_REQUIREMENTS.length, percent: Math.round((done / READINESS_REQUIREMENTS.length) * 100) };
}

function formatUpdated(value?: string) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

export default function AppHome() {
  const { user } = useAuth();
  const [items, setItems] = useState<Portfolio[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [vertical, setVertical] = useState<Vertical>("ux_ui");
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (!user.onboarding?.completed) {
      router.replace("/onboarding");
      return;
    }
    Promise.all([
      api<Portfolio[]>("/portfolios"),
      api<Asset[]>("/assets").catch(() => []),
      api<Application[]>("/applications").catch(() => []),
    ]).then(([portfolios, assetRows, applicationRows]) => {
      setItems(portfolios);
      setAssets(assetRows);
      setApplications(applicationRows);
      const preferred = user.onboarding?.vertical as Vertical | undefined;
      if (preferred && VERTICALS.includes(preferred)) setVertical(preferred);
    });
  }, [user, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const latest = items[0];
  const readiness = useMemo(() => portfolioReadiness(latest, !!user?.emailVerified), [latest, user?.emailVerified]);
  const publishedCount = items.filter((p) => p.status === "published").length;
  const activeApps = applications.filter((a) => !["rejected", "withdrawn"].includes(a.status)).length;

  async function refreshList() {
    setItems(await api<Portfolio[]>("/portfolios"));
  }

  async function create() {
    setBusy("create");
    try {
      const p = await api<{ _id: string }>("/portfolios", {
        method: "POST",
        body: JSON.stringify({ title: "My role-ready resume", vertical, templateId: "advanced-creative-suite" }),
      });
      router.push(`/app/portfolios/${p._id}/edit`);
    } finally {
      setBusy("");
    }
  }

  async function publish(id: string) {
    setBusy(`publish-${id}`);
    try {
      await api(`/portfolios/${id}/publish`, { method: "POST", body: JSON.stringify({}) });
      await refreshList();
      setToast("Portfolio published.");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setBusy("");
    }
  }

  async function unpublish(id: string) {
    setBusy(`unpublish-${id}`);
    try {
      await api(`/portfolios/${id}/unpublish`, { method: "POST", body: JSON.stringify({}) });
      await refreshList();
      setToast("Portfolio unpublished.");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Unpublish failed");
    } finally {
      setBusy("");
    }
  }

  async function archive(id: string) {
    if (!confirm("Archive this portfolio? It will leave your active list.")) return;
    setBusy(`archive-${id}`);
    try {
      await api(`/portfolios/${id}`, { method: "DELETE" });
      await refreshList();
      setToast("Portfolio archived.");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Archive failed");
    } finally {
      setBusy("");
    }
  }

  async function exportFile(id: string, format: "pdf" | "docx") {
    setBusy(`${format}-${id}`);
    try {
      const r = await api<{ downloadPath: string; message?: string }>("/exports", {
        method: "POST",
        body: JSON.stringify({ portfolioId: id, format }),
      });
      window.open(`${API}${r.downloadPath}`, "_blank");
      setToast(r.message || "Portfolio exported successfully.");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy("");
    }
  }

  return (
    <AppShell>
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroMain}>
            <p className={styles.eyebrow}>Career workspace</p>
            <h1 className={styles.title}>Your portfolios and resumes</h1>
            <p className={styles.lead}>
              Create from a starter template, edit blocks, export PDF or Word, and publish a live portfolio when you are ready.
            </p>
            <div className={styles.heroActions}>
              <button className="btn accent lg" onClick={create} disabled={busy === "create"}>
                {busy === "create" ? "Creating…" : "New portfolio"}
              </button>
              {latest ? (
                <Link className={`btn ghost lg ${styles.heroGhost}`} href={`/app/portfolios/${latest._id}/edit`}>
                  Continue editing
                </Link>
              ) : (
                <Link className={`btn ghost lg ${styles.heroGhost}`} href="/app/profile">
                  Complete profile
                </Link>
              )}
            </div>
          </div>

          <aside className={styles.heroSide}>
            <p className={styles.eyebrow}>Readiness</p>
            <div className={styles.scoreValue}>{readiness.percent}%</div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${readiness.percent}%` }} />
            </div>
            <p className="muted">
              {readiness.done} of {readiness.total} essentials complete before publish-ready.
            </p>
          </aside>
        </section>

        <section className={styles.grid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.eyebrow}>Next actions</p>
                <h2 className={styles.panelTitle}>Move your career forward</h2>
              </div>
            </div>
            <div className={styles.actionsGrid}>
              <button className={styles.actionCard} onClick={create} disabled={busy === "create"}>
                <span>
                  <h3 className={styles.actionTitle}>Create portfolio</h3>
                  <p className={styles.actionBody}>Start from a creative template, then export as resume PDF or Word.</p>
                </span>
                <span className="muted">Start</span>
              </button>
              <Link className={styles.actionCard} href={latest ? `/app/portfolios/${latest._id}/edit` : "/app"}>
                <span>
                  <h3 className={styles.actionTitle}>Build & model resume</h3>
                  <p className={styles.actionBody}>Edit blocks, upload work, preview, and tailor content to a role.</p>
                </span>
                <span className="muted">{latest ? "Open builder" : "Create first"}</span>
              </Link>
              <Link className={styles.actionCard} href="/app/media">
                <span>
                  <h3 className={styles.actionTitle}>Upload media</h3>
                  <p className={styles.actionBody}>Images and audio for portfolio proof (PNG, JPEG, MP3).</p>
                </span>
                <span className="muted">{assets.length} files</span>
              </Link>
              <Link className={styles.actionCard} href="/app/profile">
                <span>
                  <h3 className={styles.actionTitle}>User profile</h3>
                  <p className={styles.actionBody}>Name, target role, creative discipline, and privacy settings.</p>
                </span>
                <span className="muted">{user?.emailVerified ? "Verified" : "Verify email"}</span>
              </Link>
              <Link className={styles.actionCard} href="/app/applications">
                <span>
                  <h3 className={styles.actionTitle}>Track applications</h3>
                  <p className={styles.actionBody}>Log roles and keep interviews and offers visible.</p>
                </span>
                <span className="muted">{activeApps} active</span>
              </Link>
              <Link className={styles.actionCard} href={latest ? `/app/portfolios/${latest._id}/edit` : "/app"}>
                <span>
                  <h3 className={styles.actionTitle}>AI role-fit score</h3>
                  <p className={styles.actionBody}>Score relevance and get suggestions before you apply.</p>
                </span>
                <span className="muted">In builder</span>
              </Link>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.eyebrow}>Publish checklist</p>
                <h2 className={styles.panelTitle}>Content essentials</h2>
              </div>
            </div>
            <div className={styles.statusList}>
              {READINESS_REQUIREMENTS.map((item) => {
                const done = readiness.checks[item.id];
                return (
                  <div key={item.id} className={styles.statusItem}>
                    <span className={`${styles.statusDot} ${done ? styles.statusDone : ""}`}>{done ? "✓" : "·"}</span>
                    <span>
                      <p className={styles.statusLabel}>{item.label}</p>
                      <p className={styles.statusHint}>{item.hint}</p>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.panel} style={{ marginTop: 24 }}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>Your work</p>
              <h2 className={styles.panelTitle}>Portfolios</h2>
            </div>
            <div className={styles.createRow}>
              <select
                className={styles.verticalSelect}
                value={vertical}
                onChange={(e) => setVertical(e.target.value as Vertical)}
                aria-label="Creative discipline for new portfolio"
              >
                {VERTICALS.map((v) => (
                  <option key={v} value={v}>{VERTICAL_LABELS[v]}</option>
                ))}
              </select>
              <button className="btn accent" onClick={create} disabled={busy === "create"}>
                {busy === "create" ? "Creating…" : "New portfolio"}
              </button>
            </div>
          </div>
          {items.length ? (
            <div className={styles.portfolioList}>
              {items.map((p) => (
                <article key={p._id} className={styles.portfolioCard}>
                  <div>
                    <div className={styles.portfolioTitleRow}>
                      <h3 className={styles.portfolioTitle}>{p.title}</h3>
                      <span className={`${styles.statusBadge} ${styles[`status_${p.status}`] || ""}`}>{p.status}</span>
                    </div>
                    <p className={styles.meta}>
                      {VERTICAL_LABELS[p.vertical] || p.vertical}
                      {" · "}
                      {p.targetRole || "No target role"}
                      {" · "}
                      Updated {formatUpdated(p.updatedAt)}
                    </p>
                    {p.publishedSlug ? <p className={styles.meta}>Live at /{p.publishedSlug}</p> : null}
                  </div>
                  <div className={styles.quickActions}>
                    <Link className="btn secondary sm" href={`/app/portfolios/${p._id}/edit`}>Edit</Link>
                    <button className="btn ghost sm" onClick={() => exportFile(p._id, "pdf")} disabled={busy === `pdf-${p._id}`}>
                      {busy === `pdf-${p._id}` ? "…" : "PDF"}
                    </button>
                    <button className="btn ghost sm" onClick={() => exportFile(p._id, "docx")} disabled={busy === `docx-${p._id}`}>
                      {busy === `docx-${p._id}` ? "…" : "Word"}
                    </button>
                    {p.status === "published" ? (
                      <>
                        {p.publishedSlug ? (
                          <Link className="btn accent sm" href={`/${p.publishedSlug}`}>View live</Link>
                        ) : null}
                        <button className="btn secondary sm" onClick={() => unpublish(p._id)} disabled={busy === `unpublish-${p._id}`}>
                          Unpublish
                        </button>
                      </>
                    ) : (
                      <button className="btn accent sm" onClick={() => publish(p._id)} disabled={busy === `publish-${p._id}`}>
                        Publish
                      </button>
                    )}
                    <button className="btn ghost sm" onClick={() => archive(p._id)} disabled={busy === `archive-${p._id}`}>
                      Archive
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <h3>No portfolio yet</h3>
              <p className="muted">Create your first VitaCircle project with starter blocks for a creative resume and portfolio.</p>
              <button className="btn accent" onClick={create} disabled={busy === "create"}>Create portfolio</button>
            </div>
          )}
          <p className="muted" style={{ marginTop: 18 }}>
            Published: {publishedCount} · Media: {assets.length} · Applications: {applications.length}
          </p>
        </section>
        {toast ? <div className="toast" role="status">{toast}</div> : null}
      </main>
    </AppShell>
  );
}
