"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import styles from "./Logo.module.css";

type LogoProps = {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  light?: boolean;
  animate?: boolean;
  className?: string;
};

const sizes = { sm: 28, md: 36, lg: 48 };

export function Logo({ variant = "full", size = "md", light = false, animate = true, className = "" }: LogoProps) {
  const iconSize = sizes[size];
  const wordClass = light ? `${styles.word} ${styles.wordLight}` : styles.word;
  const uid = useId().replace(/:/g, "");
  const coreGrad = `coreGrad-${uid}`;
  const ringGrad = `ringGrad-${uid}`;

  const icon = (
    <motion.svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.icon}
      aria-hidden
      animate={
        animate
          ? {
              rotate: [0, 0, 360],
            }
          : undefined
      }
      transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
    >
      <circle cx="24" cy="24" r="20" stroke={`url(#${ringGrad})`} strokeWidth="1.5" opacity="0.4" />
      <motion.circle
        cx="24"
        cy="24"
        r="11"
        fill={`url(#${coreGrad})`}
        animate={animate ? { scale: [1, 1.04, 1] } : undefined}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="12" cy="18" r="3" fill="#3AAFA9" />
      <circle cx="36" cy="18" r="3" fill="#3AAFA9" />
      <circle cx="24" cy="36" r="3" fill="#2B6CB0" />
      <circle cx="24" cy="10" r="2.5" fill="#fff" opacity="0.9" />
      <path d="M24 13 L12 18 M24 13 L36 18 M24 24 L24 33" stroke="#3AAFA9" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
      <motion.circle
        cx="24"
        cy="24"
        r="2"
        fill="#fff"
        animate={animate ? { opacity: [0.6, 1, 0.6] } : undefined}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <defs>
        <linearGradient id={coreGrad} x1="13" y1="13" x2="35" y2="35">
          <stop stopColor="#2B6CB0" />
          <stop offset="1" stopColor="#3AAFA9" />
        </linearGradient>
        <linearGradient id={ringGrad} x1="4" y1="4" x2="44" y2="44">
          <stop stopColor="#2B6CB0" />
          <stop offset="1" stopColor="#3AAFA9" />
        </linearGradient>
      </defs>
    </motion.svg>
  );

  if (variant === "icon") {
    return (
      <span className={`${styles.wrap} ${className}`} aria-label="Vitacircle">
        {icon}
      </span>
    );
  }

  return (
    <span className={`${styles.wrap} ${styles.full} ${className}`}>
      {icon}
      <span className={wordClass}>
        <span className={styles.brand}>Vita</span>
        <span className={styles.brandAccent}>circle</span>
      </span>
    </span>
  );
}
