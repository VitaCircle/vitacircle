"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/brand/Logo";
import styles from "@/components/auth/auth.module.css";

export default function OAuthCallback() {
  const router = useRouter();
  const { setAccess, refresh } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const params = new URLSearchParams(hash);
    const access = params.get("access");
    if (access) {
      setAccess(access);
      refresh().then(() => router.replace("/app"));
      return;
    }
    setError("Sign-in could not be completed. Please try again.");
  }, [router, setAccess, refresh]);

  return (
    <div className={styles.page}>
      <header className={styles.authHeader}>
        <Link href="/" aria-label="Vitacircle home">
          <Logo size="sm" animate={false} />
        </Link>
      </header>
      <main className={styles.formPanel} style={{ flex: 1 }}>
        <div className={styles.formInner} style={{ textAlign: "center" }}>
          {error ? (
            <>
              <h1 className={styles.formTitle}>Sign-in failed</h1>
              <p className={styles.formSubtitle}>{error}</p>
              <Link href="/login" className="btn accent lg block">
                Back to log in
              </Link>
            </>
          ) : (
            <>
              <h1 className={styles.formTitle}>Signing you in</h1>
              <p className={styles.formSubtitle}>One moment while we open your workspace…</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
