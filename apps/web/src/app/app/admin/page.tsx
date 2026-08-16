"use client";

import { AppShell } from "@/components/layout/AppShell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<{ _id: string; email: string; username: string; banned?: boolean }[]>([]);
  const [cost, setCost] = useState<unknown>(null);

  useEffect(() => {
    if (user?.role !== "admin") return;
    api<typeof users>("/admin/users").then(setUsers);
    api("/admin/ai-cost").then(setCost);
  }, [user]);

  if (user && user.role !== "admin") return <AppShell><p style={{ padding: 32 }}>Admin only.</p></AppShell>;

  return (
    <AppShell>
      <main style={{ padding: 32 }}>
        <h1>Admin</h1>
        <h2>AI usage</h2>
        <pre>{JSON.stringify(cost, null, 2)}</pre>
        <h2>Users</h2>
        {users.map((u) => (
          <div key={u._id} className="card" style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span>{u.email} ({u.username})</span>
            <button className="btn ghost" onClick={() => api(`/admin/users/${u._id}/ban`, { method: "POST", body: JSON.stringify({ banned: !u.banned }) })}>
              {u.banned ? "Unban" : "Ban"}
            </button>
          </div>
        ))}
      </main>
    </AppShell>
  );
}
