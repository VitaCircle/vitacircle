import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { landingCopy } from "@/components/landing/landingCopy";
import styles from "@/components/landing/landing.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.footerBrand} data-aos="fade-up">
          <Link href="/">
            <Logo size="sm" animate={false} />
          </Link>
          <p>{landingCopy.tagline}</p>
        </div>
        <div className={styles.footerCol} data-aos="fade-up" data-aos-delay="50">
          <h4>Product</h4>
          <Link href="/#features">Features</Link>
          <Link href="/#templates">Templates</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/talent">Talent directory</Link>
        </div>
        <div className={styles.footerCol} data-aos="fade-up" data-aos-delay="100">
          <h4>Resources</h4>
          <Link href="/about">About</Link>
          <Link href="/docs/api">API docs</Link>
          <Link href="/recruiter">Recruiters</Link>
          <Link href="/register">Sign up</Link>
          <Link href="/login">Log in</Link>
        </div>
        <div className={styles.footerCol} data-aos="fade-up" data-aos-delay="150">
          <h4>Legal</h4>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/cookies">Cookies</Link>
          <Link href="/legal/dmca">DMCA</Link>
        </div>
      </div>
      <div className={styles.footerBottom}>
        © {new Date().getFullYear()} Vitacircle. All rights reserved.
      </div>
    </footer>
  );
}
