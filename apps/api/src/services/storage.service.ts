import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createReadStream, createWriteStream, existsSync, mkdirSync } from "fs";
import { copyFile, unlink, writeFile, readFile } from "fs/promises";
import { join, dirname } from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

@Injectable()
export class StorageService {
  private root: string;

  constructor(private config: ConfigService) {
    this.root = this.config.get("STORAGE_LOCAL_DIR") || "./storage";
    mkdirSync(join(this.root, "uploads"), { recursive: true });
    mkdirSync(join(this.root, "exports"), { recursive: true });
  }

  keyPath(key: string) {
    return join(this.root, key);
  }

  async putFile(key: string, buffer: Buffer) {
    const path = this.keyPath(key);
    mkdirSync(dirname(path), { recursive: true });
    await writeFile(path, buffer);
    return key;
  }

  async putStream(key: string, stream: Readable) {
    const path = this.keyPath(key);
    mkdirSync(dirname(path), { recursive: true });
    await pipeline(stream, createWriteStream(path));
    return key;
  }

  async read(key: string) {
    return readFile(this.keyPath(key));
  }

  createReadStream(key: string) {
    return createReadStream(this.keyPath(key));
  }

  exists(key: string) {
    return existsSync(this.keyPath(key));
  }

  async remove(key: string) {
    const path = this.keyPath(key);
    if (existsSync(path)) await unlink(path);
  }

  async copy(from: string, to: string) {
    mkdirSync(dirname(this.keyPath(to)), { recursive: true });
    await copyFile(this.keyPath(from), this.keyPath(to));
  }

  publicUrl(key: string) {
    const base = this.config.get("S3_PUBLIC_BASE_URL") || this.config.get("API_URL") || "http://localhost:4000";
    return `${base}/assets/raw?key=${encodeURIComponent(key)}`;
  }
}
