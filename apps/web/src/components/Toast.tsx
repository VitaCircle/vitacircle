"use client";

import { useEffect, useState } from "react";

export function Toast({ message, onDone }: { message: string; onDone?: () => void }) {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => {
      setOpen(false);
      onDone?.();
    }, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  if (!open) return null;
  return <div className="toast">{message}</div>;
}
