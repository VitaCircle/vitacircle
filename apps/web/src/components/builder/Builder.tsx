"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block, DraftTree } from "@vitacircle/shared";
import { BLOCK_TYPES } from "@vitacircle/shared";
import { api } from "@/lib/api";
import { PortfolioRenderer } from "../blocks/PortfolioRenderer";
import { Toast } from "../Toast";

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes}>
      <button {...listeners} className="btn ghost" style={{ fontSize: 12, marginBottom: 6 }}>
        Drag
      </button>
      {children}
    </div>
  );
}

export function Builder({ portfolioId }: { portfolioId: string }) {
  const [doc, setDoc] = useState<{ title: string; targetRole?: string; draft: DraftTree; status: string; publishedSlug?: string } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [preview, setPreview] = useState<"desktop" | "mobile">("desktop");
  const [toast, setToast] = useState("");
  const [ai, setAi] = useState<{ score?: number; critique?: string[]; suggestions?: { blockId?: string; field?: string; proposed: string; reason: string }[]; rubric?: Record<string, number> } | null>(null);
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ title: string; targetRole?: string; draft: DraftTree; status: string; publishedSlug?: string }>(`/portfolios/${portfolioId}`).then(setDoc);
  }, [portfolioId]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
  const selectedBlock = useMemo(() => doc?.draft.blocks.find((b) => b.id === selected), [doc, selected]);

  async function save(next: DraftTree, extra: Record<string, unknown> = {}) {
    if (!doc) return;
    const updated = await api<typeof doc>(`/portfolios/${portfolioId}`, {
      method: "PATCH",
      body: JSON.stringify({ draft: next, title: doc.title, targetRole: doc.targetRole, ...extra }),
    });
    setDoc({ ...updated, draft: next });
  }

  function onDragEnd(e: DragEndEvent) {
    if (!doc || !e.over) return;
    const ids = doc.draft.blocks.map((b) => b.id);
    const oldIndex = ids.indexOf(String(e.active.id));
    const newIndex = ids.indexOf(String(e.over.id));
    const blocks = arrayMove(doc.draft.blocks, oldIndex, newIndex);
    const next = { ...doc.draft, blocks };
    setDoc({ ...doc, draft: next });
    save(next);
  }

  function patchBlock(patch: Record<string, unknown>) {
    if (!doc || !selectedBlock) return;
    const blocks = doc.draft.blocks.map((b) => (b.id === selectedBlock.id ? { ...b, data: { ...b.data, ...patch } } : b));
    const next = { ...doc.draft, blocks };
    setDoc({ ...doc, draft: next });
    save(next);
  }

  async function upload(file: File, field: "portrait" | "media" | "audio" | "video") {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api<{ id: string; key: string; message: string }>("/assets/upload", { method: "POST", body: fd });
    setToast(res.message);
    if (field === "audio" || field === "video") patchBlock({ assetId: res.key });
    if (field === "media" && selectedBlock) {
      const media = ([...(((selectedBlock.data as { media?: { assetId: string; alt: string }[] }).media) || []), { assetId: res.key, alt: file.name }]);
      patchBlock({ media });
    }
    if (field === "portrait") patchBlock({ portraitAssetId: res.key });
  }

  async function runScore() {
    setBusy(true);
    try {
      const r = await api<{ score: number; critique: string[]; suggestions: never[]; rubric: Record<string, number> }>("/ai/score", {
        method: "POST",
        body: JSON.stringify({ portfolioId, targetRole: doc?.targetRole, jobDescription: jd || undefined }),
      });
      setAi(r);
    } catch (e) {
      setToast(e instanceof Error ? e.message : "AI failed");
    } finally {
      setBusy(false);
    }
  }

  async function exportFile(format: "pdf" | "docx" | "ats-pdf") {
    setBusy(true);
    try {
      const r = await api<{ downloadPath: string; message: string }>("/exports", {
        method: "POST",
        body: JSON.stringify({ portfolioId, format }),
      });
      setToast(r.message);
      window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}${r.downloadPath}`, "_blank");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    setBusy(true);
    try {
      const r = await api<{ url: string }>("/portfolios/" + portfolioId + "/publish", { method: "POST", body: JSON.stringify({}) });
      setToast("Published");
      window.open(r.url, "_blank");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setBusy(false);
    }
  }

  if (!doc) return <p className="container">Loading builder…</p>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 320px", minHeight: "calc(100vh - 64px)" }}>
      <aside style={{ borderRight: "1px solid var(--line)", padding: 16, overflow: "auto" }}>
        <input value={doc.title} onChange={(e) => setDoc({ ...doc, title: e.target.value })} onBlur={() => save(doc.draft)} style={{ width: "100%", marginBottom: 12 }} />
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={doc.draft.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {doc.draft.blocks.map((b) => (
              <SortableRow key={b.id} id={b.id}>
                <button
                  className="btn ghost"
                  style={{ width: "100%", justifyContent: "flex-start", background: selected === b.id ? "var(--line)" : "transparent" }}
                  onClick={() => setSelected(b.id)}
                >
                  {b.type}
                </button>
              </SortableRow>
            ))}
          </SortableContext>
        </DndContext>
        <select
          style={{ marginTop: 16, width: "100%" }}
          defaultValue=""
          onChange={(e) => {
            const type = e.target.value as Block["type"];
            if (!type) return;
            const block: Block = { id: `${type}-${Date.now()}`, type, data: {} };
            const next = { ...doc.draft, blocks: [...doc.draft.blocks, block] };
            setDoc({ ...doc, draft: next });
            save(next);
            e.target.value = "";
          }}
        >
          <option value="">Add block</option>
          {BLOCK_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </aside>
      <main style={{ overflow: "auto", background: "#efeae3" }}>
        <div style={{ display: "flex", gap: 8, padding: 12, justifyContent: "center" }}>
          <button className="btn ghost" onClick={() => setPreview("desktop")}>Desktop</button>
          <button className="btn ghost" onClick={() => setPreview("mobile")}>Mobile</button>
        </div>
        <div style={{ margin: "0 auto", width: preview === "mobile" ? 390 : "100%", maxWidth: 920, background: "var(--card)", minHeight: 640 }}>
          <PortfolioRenderer tree={doc.draft} />
        </div>
      </main>
      <aside style={{ borderLeft: "1px solid var(--line)", padding: 16, overflow: "auto", fontSize: 14 }}>
        <div className="field">
          <label>Target role</label>
          <input value={doc.targetRole || ""} onChange={(e) => setDoc({ ...doc, targetRole: e.target.value })} onBlur={() => save(doc.draft)} />
        </div>
        <div className="field">
          <label>Accent color</label>
          <input
            type="color"
            value={doc.draft.theme?.colorAccent || "#C45C26"}
            onChange={(e) => {
              const next = { ...doc.draft, theme: { ...(doc.draft.theme || { fontDisplay: "Fraunces", fontBody: "Source Sans 3", colorBg: "#FAF8F5", colorInk: "#1A1916", colorMuted: "#6B6560", radius: "sm" as const, density: "regular" as const }), colorAccent: e.target.value } };
              setDoc({ ...doc, draft: next });
              save(next);
            }}
          />
        </div>
        {selectedBlock ? (
          <BlockEditor block={selectedBlock} onChange={patchBlock} onUpload={upload} />
        ) : (
          <p className="muted">Select a block to edit.</p>
        )}
        <hr style={{ borderColor: "var(--line)" }} />
        <textarea placeholder="Paste a job description (Pro tailor)" value={jd} onChange={(e) => setJd(e.target.value)} rows={5} style={{ width: "100%" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          <button className="btn accent" disabled={busy} onClick={runScore}>AI role-fit score</button>
          <button className="btn ghost" disabled={busy} onClick={async () => {
            setBusy(true);
            try {
              const r = await api<{ suggestions: { proposed: string; reason: string }[] }>("/ai/tailor", { method: "POST", body: JSON.stringify({ portfolioId, jobDescription: jd }) });
              setAi({ suggestions: r.suggestions, critique: ["Tailor suggestions — accept only what is true."] });
            } catch (e) {
              setToast(e instanceof Error ? e.message : "Tailor failed");
            } finally { setBusy(false); }
          }}>Tailor to job</button>
          <button className="btn ghost" disabled={busy} onClick={() => exportFile("pdf")}>Export PDF</button>
          <button className="btn ghost" disabled={busy} onClick={() => exportFile("docx")}>Export Word</button>
          <button className="btn ghost" disabled={busy} onClick={() => exportFile("ats-pdf")}>ATS resume PDF</button>
          <button className="btn" disabled={busy} onClick={publish}>Publish live URL</button>
        </div>
        {ai ? (
          <div style={{ marginTop: 16 }}>
            {ai.score !== undefined ? <p className="display" style={{ fontSize: 36 }}>{ai.score}</p> : null}
            {ai.rubric ? (
              <ul className="muted">
                {Object.entries(ai.rubric).map(([k, v]) => (
                  <li key={k}>{k}: {v}</li>
                ))}
              </ul>
            ) : null}
            {ai.critique?.map((c) => <p key={c}>{c}</p>)}
            {ai.suggestions?.map((s, i) => (
              <div key={i} className="card" style={{ marginTop: 8 }}>
                <p>{s.proposed}</p>
                <p className="muted">{s.reason}</p>
                {s.blockId && s.field ? (
                  <button className="btn ghost" onClick={() => api(`/portfolios/${portfolioId}/apply-suggestion`, { method: "POST", body: JSON.stringify({ blockId: s.blockId, field: s.field, proposed: s.proposed }) }).then(() => setToast("Suggestion applied"))}>
                    Accept
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </aside>
      {toast ? <Toast message={toast} onDone={() => setToast("")} /> : null}
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
  onUpload,
}: {
  block: Block;
  onChange: (p: Record<string, unknown>) => void;
  onUpload: (file: File, field: "portrait" | "media" | "audio" | "video") => void;
}) {
  const d = block.data as Record<string, string>;
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ [k]: e.target.value });
  return (
    <div>
      <h3>{block.type}</h3>
      {["name", "headline", "location", "title", "problem", "role", "outcome", "body", "email", "website", "captions"].map((k) =>
        k in d || ["hero", "about", "project", "contact", "audio", "video"].includes(block.type) ? (
          <div className="field" key={k}>
            <label>{k}</label>
            {k === "body" || k === "problem" || k === "outcome" ? (
              <textarea rows={4} value={(d[k] as string) || ""} onChange={set(k)} />
            ) : (
              <input value={(d[k] as string) || ""} onChange={set(k)} />
            )}
          </div>
        ) : null,
      )}
      {block.type === "skills" ? (
        <div className="field">
          <label>Skills (comma separated)</label>
          <input value={((block.data as { items?: string[] }).items || []).join(", ")} onChange={(e) => onChange({ items: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
        </div>
      ) : null}
      {block.type === "gallery" || block.type === "project" ? (
        <label className="btn ghost">
          Upload image
          <input type="file" accept="image/png,image/jpeg" hidden onChange={(e) => e.target.files && onUpload(e.target.files[0], "media")} />
        </label>
      ) : null}
      {block.type === "audio" ? (
        <label className="btn ghost">
          Upload mp3
          <input type="file" accept="audio/mpeg,.mp3" hidden onChange={(e) => e.target.files && onUpload(e.target.files[0], "audio")} />
        </label>
      ) : null}
      {block.type === "video" ? (
        <label className="btn ghost">
          Upload video
          <input type="file" accept="video/mp4,video/webm" hidden onChange={(e) => e.target.files && onUpload(e.target.files[0], "video")} />
        </label>
      ) : null}
    </div>
  );
}
