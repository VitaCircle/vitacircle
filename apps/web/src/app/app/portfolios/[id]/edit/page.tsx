"use client";

import { Builder } from "@/components/builder/Builder";
import { useParams } from "next/navigation";

export default function EditPage() {
  const params = useParams<{ id: string }>();
  return <Builder portfolioId={params.id} />;
}
