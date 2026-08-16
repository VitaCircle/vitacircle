"use client";

import { useEffect } from "react";
import { setToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function OAuthCallback() {
  const router = useRouter();
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const params = new URLSearchParams(hash);
    const access = params.get("access");
    if (access) setToken(access);
    router.replace("/app");
  }, [router]);
  return <p className="container">Signing you in…</p>;
}
