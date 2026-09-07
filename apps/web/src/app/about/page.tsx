"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AosInit } from "@/components/landing/AosInit";
import { NewsletterForm } from "@/components/landing/NewsletterForm";
import { landingCopy } from "@/components/landing/landingCopy";
import styles from "@/components/landing/landing.module.css";

export default function AboutPage() {
  const c = landingCopy.about;
  const [contactMsg, setContactMsg] = useState("");
  const [contactError, setContactError] = useState("");
  const [contactLoading, setContactLoading] = useState(false);

  async function onContact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setContactError("");
    setContactMsg("");
    setContactLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await api("/platform/contact", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          subject: form.get("subject"),
          message: form.get("message"),
        }),
      });
      setContactMsg(c.form.success);
      e.currentTarget.reset();
    } catch (err) {
      setContactError(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setContactLoading(false);
    }
  }

  return (
    <>
      <AosInit />
      <SiteHeader />
      <main>
        <section className={`${styles.aboutHero} container`}>
          <p className={styles.eyebrow}>{c.eyebrow}</p>
          <h1 className={styles.sectionTitle}>{c.title}</h1>
          <p className={styles.aboutLead}>{c.mission}</p>
        </section>

        <section className={`${styles.section} container`}>
          <div className={styles.aboutStoryGrid}>
            <div data-aos="fade-up">
              <h2 className={styles.sectionTitle}>{c.story.title}</h2>
              <p className={styles.aboutBody}>{c.story.body}</p>
            </div>
            <div className={styles.aboutImageWrap} data-aos="fade-up" data-aos-delay="80">
              <Image
                src="/student-researching-bg.jpg"
                alt="Student researching career opportunities"
                fill
                sizes="(max-width: 800px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </section>

        <section id="contact" className={`${styles.section} container`}>
          <div className={styles.sectionHeader} data-aos="fade-up">
            <p className={styles.eyebrow}>Get in touch</p>
            <h2 className={styles.sectionTitle}>{c.contact.title}</h2>
            <p className={styles.aboutBody}>{c.contact.body}</p>
          </div>
          <div className={styles.contactGrid}>
            <div className={`${styles.contactCard} ${styles.glassCard}`} data-aos="fade-up">
              <h3>Phone</h3>
              <a href={`tel:${c.contact.phone.replace(/\D/g, "")}`}>{c.contact.phone}</a>
              <h3>Email</h3>
              <a href={`mailto:${c.contact.email}`}>{c.contact.email}</a>
              <h3>Office</h3>
              <p>{c.contact.address}</p>
            </div>
            <div className={`${styles.contactFormCard} ${styles.glassCard}`} data-aos="fade-up" data-aos-delay="80">
              <h3>{c.form.title}</h3>
              <form onSubmit={onContact}>
                <div className="field lg">
                  <label htmlFor="contact-name">Name</label>
                  <input id="contact-name" name="name" required />
                </div>
                <div className="field lg">
                  <label htmlFor="contact-email">Email</label>
                  <input id="contact-email" name="email" type="email" required />
                </div>
                <div className="field lg">
                  <label htmlFor="contact-subject">Subject</label>
                  <input id="contact-subject" name="subject" required />
                </div>
                <div className="field lg">
                  <label htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" name="message" rows={5} required />
                </div>
                {contactError ? <p style={{ color: "var(--danger)" }}>{contactError}</p> : null}
                {contactMsg ? <p style={{ color: "var(--ok)" }}>{contactMsg}</p> : null}
                <button className="btn accent lg block" type="submit" disabled={contactLoading}>
                  {c.form.submit}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section id="newsletter" className={`${styles.section} container`}>
          <div className={`${styles.newsletterBar} ${styles.glassCard}`} data-aos="fade-up">
            <div>
              <h2 className={styles.sectionTitle} style={{ marginBottom: 8 }}>
                {c.newsletter.title}
              </h2>
              <p className={styles.aboutBody} style={{ margin: 0 }}>
                {c.newsletter.body}
              </p>
            </div>
            <NewsletterForm
              source="about"
              placeholder={c.newsletter.placeholder}
              submitLabel={c.newsletter.submit}
              successMessage={c.newsletter.success}
            />
          </div>
        </section>

        <div className="container" style={{ paddingBottom: 48, textAlign: "center" }}>
          <Link href="/register" className="btn accent lg">
            Start free — create your portfolio
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
