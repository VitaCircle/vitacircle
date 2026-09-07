"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { usePrefersReducedMotion } from "./motion";

export function AosInit() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      document.querySelectorAll("[data-aos]").forEach((el) => {
        (el as HTMLElement).removeAttribute("data-aos");
      });
      return;
    }

    AOS.init({
      duration: 900,
      easing: "ease-out-cubic",
      once: true,
      offset: 72,
      delay: 0,
      mirror: false,
      anchorPlacement: "top-bottom",
    });

    const onLoad = () => AOS.refresh();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, [reduced]);

  return null;
}
