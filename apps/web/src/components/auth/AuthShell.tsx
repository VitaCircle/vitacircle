"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { landingCopy } from "@/components/landing/landingCopy";
import { ease, fadeUp } from "@/components/landing/motion";
import styles from "./auth.module.css";

type AuthShellProps = {
  title: string;
  subtitle: string;
  trust?: string[];
  headerLink?: { href: string; label: string };
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ title, subtitle, trust, headerLink, children, footer }: AuthShellProps) {
  return (
    <div className={styles.page}>
      <header className={styles.authHeader}>
        <Link href="/" aria-label="Vitacircle home">
          <Logo size="sm" animate={false} />
        </Link>
        {headerLink ? (
          <Link href={headerLink.href} className={styles.authHeaderLink}>
            {headerLink.label}
          </Link>
        ) : null}
      </header>

      <div className={styles.shell}>
        <motion.aside
          className={styles.brandPanel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease }}
        >
          <div className={styles.brandImage}>
            <Image src="/student-with-books-bg.jpg" alt="" fill priority sizes="50vw" />
          </div>
          <div className={styles.brandOverlay} aria-hidden />
          <div className={styles.brandInner}>
            <p className={styles.brandEyebrow}>{landingCopy.eyebrow}</p>
            <h1 className={styles.brandTitle}>{landingCopy.tagline}</h1>
            <p className={styles.brandSubtitle}>{landingCopy.hero.subhead}</p>
            {trust && trust.length > 0 ? (
              <ul className={styles.trustList}>
                {trust.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </motion.aside>

        <motion.main
          className={styles.formPanel}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, ease, delay: 0.06 }}
        >
          <div className={styles.formInner}>
            <h2 className={styles.formTitle}>{title}</h2>
            <p className={styles.formSubtitle}>{subtitle}</p>
            {children}
            {footer ? <div className={styles.footerLinks}>{footer}</div> : null}
          </div>
        </motion.main>
      </div>
    </div>
  );
}
