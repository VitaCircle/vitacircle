"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { BLOCK_LABELS, BLOCK_TYPES, CONTENT_PROMPTS } from "@vitacircle/shared";
import { api } from "@/lib/api";
import { PortfolioRenderer } from "../blocks/PortfolioRenderer";
import { Toast } from "../Toast";
import styles from "./builder.module.css";

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      className={styles.sortableRow}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
    >
      <button type="button" {...listeners} className={`btn ghost sm ${styles.dragHandle}`}>
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
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [ai, setAi] = useState<{ score?: number; critique?: string[]; suggestions?: { blockId?: string; field?: string; proposed: string; reason: string }[]; rubric?: Record<string, number> } | null>(null);
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ title: string; targetRole?: string; draft: DraftTree; status: string; publishedSlug?: string }>(`/portfolios/${portfolioId}`).then((d) => {
      setDoc(d);
      if (d.draft.blocks[0]) setSelected(d.draft.blocks[0].id);
    });
  }, [portfolioId]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
  const selectedBlock = useMemo(() => doc?.draft.blocks.find((b) => b.id === selected), [doc, selected]);

  async function save(next: DraftTree, extra: Record<string, unknown> = {}) {
    if (!doc) return;
    setSaveState("saving");
    try {
      const updated = await api<typeof doc>(`/portfolios/${portfolioId}`, {
        method: "PATCH",
        body: JSON.stringify({ draft: next, title: doc.title, targetRole: doc.targetRole, ...extra }),
      });
      setDoc({ ...updated, draft: next });
      setSaveState("saved");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Save failed");
      setSaveState("idle");
    }
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

  function removeBlock(id: string) {
    if (!doc) return;
    const blocks = doc.draft.blocks.filter((b) => b.id !== id);
    const next = { ...doc.draft, blocks };
    setDoc({ ...doc, draft: next });
    if (selected === id) setSelected(blocks[0]?.id || null);
    save(next);
  }

  async function upload(file: File, field: "portrait" | "media" | "audio" | "video") {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api<{ id: string; key: string; message: string }>("/assets/upload", { method: "POST", body: fd });
      setToast(res.message || "File uploaded successfully.");
      if (field === "audio" || field === "video") patchBlock({ assetId: res.key });
      if (field === "media" && selectedBlock) {
        const media = ([...(((selectedBlock.data as { media?: { assetId: string; alt: string }[] }).media) || []), { assetId: res.key, alt: file.name }]);
        patchBlock({ media });
      }
      if (field === "portrait") patchBlock({ portraitAssetId: res.key });
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Upload failed");
    }
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
      setToast(r.message || "Portfolio exported successfully.");
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

  if (!doc) return <p className="container" style={{ paddingTop: 48 }}>Loading builder…</p>;

  return (
    <div className={styles.builder}>
      <header className={styles.toolbar}>
        <div className={styles.toolbarBrand}>
          <Link href="/app" className={styles.backLink}>← Dashboard</Link>
          <Link href={`/app/portfolios/${portfolioId}/analytics`} className={styles.backLink}>Analytics</Link>
          <input
            className={styles.titleInput}
            value={doc.title}
            onChange={(e) => setDoc({ ...doc, title: e.target.value })}
            onBlur={() => save(doc.draft)}
            aria-label="Portfolio title"
          />
          <span className={`${styles.saveStatus} ${saveState === "saved" ? styles.saveStatusOk : ""}`}>
            {saveState === "saving" ? "Saving draft…" : saveState === "saved" ? "Draft saved" : doc.status}
          </span>
        </div>
        <div className={styles.toolbarActions}>
          <div className={styles.previewToggle} role="group" aria-label="Preview size">
            <button type="button" data-active={preview === "desktop"} onClick={() => setPreview("desktop")}>Desktop</button>
            <button type="button" data-active={preview === "mobile"} onClick={() => setPreview("mobile")}>Mobile</button>
          </div>
          <button type="button" className="btn ghost sm" disabled={busy} onClick={() => exportFile("pdf")}>
            {busy ? "…" : "PDF"}
          </button>
          <button type="button" className="btn ghost sm" disabled={busy} onClick={() => exportFile("docx")}>
            Word
          </button>
          <button type="button" className="btn accent sm" disabled={busy} onClick={publish}>
            Publish
          </button>
        </div>
      </header>

      <aside className={styles.sidebar}>
        <p className={styles.sidebarTitle}>Blocks</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={doc.draft.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className={styles.blockList}>
              {doc.draft.blocks.map((b) => (
                <SortableRow key={b.id} id={b.id}>
                  <button
                    type="button"
                    className={`btn ghost sm ${styles.blockBtn} ${selected === b.id ? styles.blockBtnActive : ""}`}
                    onClick={() => setSelected(b.id)}
                  >
                    {BLOCK_LABELS[b.type]}
                  </button>
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <select
          className={styles.addBlock}
          defaultValue=""
          aria-label="Add block"
          onChange={(e) => {
            const type = e.target.value as Block["type"];
            if (!type) return;
            const block: Block = { id: `${type}-${Date.now()}`, type, data: {} };
            const next = { ...doc.draft, blocks: [...doc.draft.blocks, block] };
            setDoc({ ...doc, draft: next });
            setSelected(block.id);
            save(next);
            e.target.value = "";
          }}
        >
          <option value="">Add block…</option>
          {BLOCK_TYPES.map((t) => (
            <option key={t} value={t}>
              {BLOCK_LABELS[t]}
            </option>
          ))}
        </select>
      </aside>

      <main className={styles.previewPane}>
        <div className={`${styles.previewFrame} ${preview === "mobile" ? styles.previewFrameMobile : ""}`}>
          <PortfolioRenderer tree={doc.draft} />
        </div>
      </main>

      <aside className={styles.inspector}>
        <p className={styles.inspectorTitle}>Inspector</p>
        <div className="field">
          <label htmlFor="builder-role">Target role</label>
          <input
            id="builder-role"
            value={doc.targetRole || ""}
            onChange={(e) => setDoc({ ...doc, targetRole: e.target.value })}
            onBlur={() => save(doc.draft)}
            placeholder="Role for AI scoring"
          />
        </div>
        <div className="field">
          <label htmlFor="builder-accent">Accent color</label>
          <input
            id="builder-accent"
            type="color"
            value={doc.draft.theme?.colorAccent || "#175c62"}
            onChange={(e) => {
              const next = {
                ...doc.draft,
                theme: {
                  ...(doc.draft.theme || {
                    fontDisplay: "Fraunces",
                    fontBody: "Source Sans 3",
                    colorBg: "#FAF8F5",
                    colorInk: "#1A1916",
                    colorMuted: "#6B6560",
                    radius: "sm" as const,
                    density: "regular" as const,
                  }),
                  colorAccent: e.target.value,
                },
              };
              setDoc({ ...doc, draft: next });
              save(next);
            }}
          />
        </div>

        {selectedBlock ? (
          <BlockEditor
            block={selectedBlock}
            onChange={patchBlock}
            onUpload={upload}
            onRemove={() => removeBlock(selectedBlock.id)}
          />
        ) : (
          <p className="muted">Select a block to edit.</p>
        )}

        <hr className={styles.divider} />
        <p className={styles.inspectorTitle}>AI & export</p>
        <textarea
          className={styles.jdField}
          placeholder="Paste a job description (optional tailor)"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          rows={4}
        />
        <div className={styles.actionStack}>
          <button type="button" className="btn accent" disabled={busy} onClick={runScore}>
            {busy ? "Working…" : "AI role-fit score"}
          </button>
          <button
            type="button"
            className="btn secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const r = await api<{ suggestions: { proposed: string; reason: string }[] }>("/ai/tailor", {
                  method: "POST",
                  body: JSON.stringify({ portfolioId, jobDescription: jd }),
                });
                setAi({ suggestions: r.suggestions, critique: ["Tailor suggestions — accept only what is true."] });
              } catch (e) {
                setToast(e instanceof Error ? e.message : "Tailor failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            Tailor to job
          </button>
          <button type="button" className="btn ghost" disabled={busy} onClick={() => exportFile("ats-pdf")}>
            ATS resume PDF
          </button>
        </div>

        {ai ? (
          <div className={styles.aiPanel}>
            {ai.score !== undefined ? <p className={`display ${styles.aiScore}`}>{ai.score}</p> : null}
            {ai.rubric ? (
              <ul className={styles.aiRubric}>
                {Object.entries(ai.rubric).map(([k, v]) => (
                  <li key={k}>{k}: {v}</li>
                ))}
              </ul>
            ) : null}
            {ai.critique?.map((c) => <p key={c}>{c}</p>)}
            {ai.suggestions?.map((s, i) => (
              <div key={i} className={`card ${styles.suggestion}`}>
                <p>{s.proposed}</p>
                <p className="muted">{s.reason}</p>
                {s.blockId && s.field ? (
                  <button
                    type="button"
                    className="btn secondary sm"
                    onClick={() =>
                      api(`/portfolios/${portfolioId}/apply-suggestion`, {
                        method: "POST",
                        body: JSON.stringify({ blockId: s.blockId, field: s.field, proposed: s.proposed }),
                      }).then(() => setToast("Suggestion applied"))
                    }
                  >
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
  onRemove,
}: {
  block: Block;
  onChange: (p: Record<string, unknown>) => void;
  onUpload: (file: File, field: "portrait" | "media" | "audio" | "video") => void;
  onRemove: () => void;
}) {
  const d = block.data as Record<string, string>;
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ [k]: e.target.value });

  const listTypes = ["experience", "education", "testimonials", "awards"] as const;
  const isList = listTypes.includes(block.type as (typeof listTypes)[number]);

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: 18 }}>{BLOCK_LABELS[block.type]}</h3>
      <p className={`muted ${styles.prompt}`}>{CONTENT_PROMPTS[block.type]}</p>

      {block.type === "hero" ? (
        <label className={`btn secondary sm ${styles.uploadLabel}`}>
          Upload portrait
          <input type="file" accept="image/png,image/jpeg" hidden onChange={(e) => e.target.files && onUpload(e.target.files[0], "portrait")} />
        </label>
      ) : null}

      {["name", "headline", "location", "title", "problem", "role", "outcome", "body", "email", "website", "linkedin", "captions"].map((k) =>
        k in d || ["hero", "about", "project", "contact", "audio", "video"].includes(block.type) ? (
          <div className="field" key={k}>
            <label>{k === "body" ? "Career story" : k.charAt(0).toUpperCase() + k.slice(1)}</label>
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
          <input
            value={((block.data as { items?: string[] }).items || []).join(", ")}
            onChange={(e) => onChange({ items: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
          />
        </div>
      ) : null}

      {isList ? (
        <ListItemsEditor
          block={block}
          onChange={onChange}
        />
      ) : null}

      {block.type === "gallery" || block.type === "project" ? (
        <label className={`btn secondary sm ${styles.uploadLabel}`}>
          Upload image
          <input type="file" accept="image/png,image/jpeg" hidden onChange={(e) => e.target.files && onUpload(e.target.files[0], "media")} />
        </label>
      ) : null}
      {block.type === "audio" ? (
        <label className={`btn secondary sm ${styles.uploadLabel}`}>
          Upload mp3
          <input type="file" accept="audio/mpeg,.mp3" hidden onChange={(e) => e.target.files && onUpload(e.target.files[0], "audio")} />
        </label>
      ) : null}
      {block.type === "video" ? (
        <label className={`btn secondary sm ${styles.uploadLabel}`}>
          Upload video
          <input type="file" accept="video/mp4,video/webm" hidden onChange={(e) => e.target.files && onUpload(e.target.files[0], "video")} />
        </label>
      ) : null}

      <button type="button" className="btn danger sm" style={{ marginTop: 12 }} onClick={onRemove}>
        Remove block
      </button>
    </div>
  );
}

function ListItemsEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (p: Record<string, unknown>) => void;
}) {
  const items = ((block.data as { items?: Record<string, string>[] }).items || []) as Record<string, string>[];
  const fieldsByType: Record<string, string[]> = {
    experience: ["company", "role", "dates", "summary"],
    education: ["school", "degree", "dates", "summary"],
    testimonials: ["quote", "author", "role"],
    awards: ["title", "issuer", "year", "summary"],
  };
  const fields = fieldsByType[block.type] || ["title", "summary"];

  function updateItem(index: number, key: string, value: string) {
    const next = items.map((item, i) => (i === index ? { ...item, [key]: value } : item));
    onChange({ items: next });
  }

  function addItem() {
    const blank: Record<string, string> = {};
    fields.forEach((f) => { blank[f] = ""; });
    onChange({ items: [...items, blank] });
  }

  function removeItem(index: number) {
    onChange({ items: items.filter((_, i) => i !== index) });
  }

  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="card" style={{ marginBottom: 10, padding: 12 }}>
          {fields.map((f) => (
            <div className="field" key={f}>
              <label>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
              {f === "summary" || f === "quote" ? (
                <textarea rows={3} value={item[f] || ""} onChange={(e) => updateItem(index, f, e.target.value)} />
              ) : (
                <input value={item[f] || ""} onChange={(e) => updateItem(index, f, e.target.value)} />
              )}
            </div>
          ))}
          <button type="button" className="btn ghost sm" onClick={() => removeItem(index)}>Remove entry</button>
        </div>
      ))}
      <button type="button" className="btn secondary sm" onClick={addItem}>Add entry</button>
    </div>
  );
}
