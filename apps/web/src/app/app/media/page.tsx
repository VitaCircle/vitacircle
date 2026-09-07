"use client";

import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { Toast } from "@/components/Toast";
import { useEffect, useState } from "react";

type Asset = { id: string; originalName?: string; mime: string; url: string };

export default function MediaPage() {
  const [items, setItems] = useState<Asset[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    api<Asset[]>("/assets").then(setItems);
  }, []);

  async function upload(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await api<Asset & { message: string }>("/assets/upload", { method: "POST", body: fd });
    setToast(res.message || "File uploaded successfully.");
    setItems([res, ...items]);
  }

  return (
    <AppShell>
      <main style={{ padding: 32 }}>
        <h1>Media library</h1>
        <label className="btn accent">
          Upload
          <input type="file" accept="image/png,image/jpeg,audio/mpeg,.mp3,video/mp4" hidden onChange={(e) => e.target.files && upload(e.target.files[0])} />
        </label>
        <div className="grid-2" style={{ marginTop: 16 }}>
          {items.map((a) => (
            <article key={a.id} className="card">
              <p>{a.originalName || a.mime}</p>
              {a.mime.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.url} alt="" style={{ width: "100%" }} />
              ) : a.mime.startsWith("audio/") ? (
                <audio controls src={a.url} />
              ) : (
                <a href={a.url}>Open</a>
              )}
            </article>
          ))}
        </div>
        {toast ? <Toast message={toast} onDone={() => setToast("")} /> : null}
      </main>
    </AppShell>
  );
}
