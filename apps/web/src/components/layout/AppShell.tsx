"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import styles from "./AppShell.module.css";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  if (loading) return <p className="container">Loading…</p>;
  if (!user) {
    return (
      <main className="container" style={{ paddingTop: 64 }}>
        <p>Please <Link href="/login">log in</Link>.</p>
      </main>
    );
  }
  const links = [
    { href: "/app", label: "Dashboard" },
    { href: "/app/profile", label: "Profile" },
    { href: "/app/media", label: "Media" },
    { href: "/app/import", label: "Import" },
    { href: "/app/applications", label: "Applications" },
    { href: "/app/billing", label: "Billing" },
    { href: "/app/settings", label: "Settings" },
    { href: "/app/org", label: "Organization" },
  ];
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.mobileBar}>
          <Link href="/" className="display" style={{ fontSize: 20 }}>VitaCircle</Link>
          <span className="muted" style={{ fontSize: 13 }}>{user.plan.toUpperCase()}</span>
        </div>
        <Link href="/" className={`display ${styles.brand}`}>VitaCircle</Link>
        <nav className={styles.nav}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${
                link.href === "/app"
                  ? pathname === "/app"
                    ? styles.active
                    : ""
                  : pathname === link.href || pathname.startsWith(link.href + "/")
                    ? styles.active
                    : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user.role === "admin" ? (
            <Link href="/app/admin" className={`${styles.navLink} ${pathname === "/app/admin" ? styles.active : ""}`}>
              Admin
            </Link>
          ) : null}
        </nav>
        <div className={styles.userCard}>
          <p className={styles.userName}>{user.displayName || user.username}</p>
          <p className={styles.userMeta}>{user.plan.toUpperCase()} plan</p>
          <Link href="/app/profile" className={styles.profileLink}>Edit profile</Link>
        </div>
        <button type="button" className={`btn ghost ${styles.logout}`} onClick={() => logout()}>Log out</button>
      </aside>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
