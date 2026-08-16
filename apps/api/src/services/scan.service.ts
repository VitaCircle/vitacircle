import { Injectable } from "@nestjs/common";

const MAGIC: Record<string, number[][]> = {
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "audio/mpeg": [[0xff, 0xfb], [0xff, 0xf3], [0xff, 0xf2], [0x49, 0x44, 0x33]],
  "video/mp4": [[0x00, 0x00, 0x00], [0x66, 0x74, 0x79, 0x70]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
};

function matches(buf: Buffer, sig: number[]) {
  if (buf.length < sig.length) return false;
  return sig.every((b, i) => buf[i] === b || (sig[0] === 0x00 && i < 4));
}

export function sniffMime(buffer: Buffer, claimed: string): string | null {
  const sigs = MAGIC[claimed];
  if (!sigs) return null;
  if (claimed === "video/mp4") {
    const ftyp = buffer.subarray(4, 8).toString("ascii");
    return ftyp === "ftyp" ? claimed : null;
  }
  return sigs.some((s) => matches(buffer, s)) ? claimed : null;
}

export function kindFromMime(mime: string): "image" | "audio" | "video" | "document" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  return "document";
}

@Injectable()
export class ScanService {
  async scan(_buffer: Buffer, enabled: boolean) {
    if (!enabled) return { clean: true as const };
    return { clean: true as const };
  }
}
