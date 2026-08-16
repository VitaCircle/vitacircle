"use client";

import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportPage() {
  const router = useRouter();
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");

  async function linkedin() {
    const p = await api<{ _id: string }>("/import/linkedin", {
      method: "POST",
      body: JSON.stringify({ headline, about, experience: [] }),
    });
    router.push(`/app/portfolios/${p._id}/edit`);
  }

  async function file(f: File) {
    const fd = new FormData();
    fd.append("file", f);
    const p = await api<{ _id: string }>("/import/file", { method: "POST", body: fd });
    router.push(`/app/portfolios/${p._id}/edit`);
  }

  return (
    <AppShell>
      <main style={{ padding: 32, maxWidth: 560 }}>
        <h1>Import</h1>
        <p className="muted">LinkedIn fields or a PDF/DOCX resume. We never invent employers.</p>
        <div className="field"><label>Headline</label><input value={headline} onChange={(e) => setHeadline(e.target.value)} /></div>
        <div className="field"><label>About</label><textarea rows={5} value={about} onChange={(e) => setAbout(e.target.value)} /></div>
        <button className="btn" onClick={linkedin}>Create from LinkedIn text</button>
        <label className="btn ghost" style={{ marginLeft: 8 }}>
          Upload PDF/DOCX
          <input type="file" accept=".pdf,.docx" hidden onChange={(e) => e.target.files && file(e.target.files[0])} />
        </label>
      </main>
    </AppShell>
  );
}
