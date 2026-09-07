"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth";
import styles from "@/components/landing/landing.module.css";

export function SiteHeader() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={`${styles.stickyHeader} ${scrolled ? styles.stickyHeaderScrolled : ""}`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav className={styles.headerNav}>
        <Link href="/" aria-label="Vitacircle home">
          <Logo size="sm" animate={scrolled} />
        </Link>
        <div className={styles.headerLinks}>
          <Link href="/#features">Features</Link>
          <Link href="/#templates">Templates</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/talent">Talent</Link>
          <Link href="/about">About</Link>
        </div>
        <div className={styles.headerActions}>
          {user ? (
            <>
              <Link href="/app">Workspace</Link>
              <button type="button" className="btn ghost" onClick={() => logout()}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn ghost">Log in</Link>
              <Link href="/register" className="btn accent lg">
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
