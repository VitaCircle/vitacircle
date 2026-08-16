import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { Connection } from "mongoose";
import net from "net";

async function pingRedis(url: string): Promise<boolean> {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const port = Number(parsed.port || 6379);
    return await new Promise((resolve) => {
      const socket = net.connect(port, host);
      socket.setTimeout(2000);
      socket.on("connect", () => {
        socket.write("PING\r\n");
      });
      socket.on("data", (buf) => {
        const ok = buf.toString().includes("PONG");
        socket.end();
        resolve(ok);
      });
      socket.on("error", () => resolve(false));
      socket.on("timeout", () => {
        socket.destroy();
        resolve(false);
      });
    });
  } catch {
    return false;
  }
}

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly config: ConfigService,
  ) {}

  async status() {
    const mongo = this.connection.readyState === 1;
    const redisUrl = this.config.get<string>("REDIS_URL");
    const redis = redisUrl ? await pingRedis(redisUrl) : true;
    const payload = {
      ok: mongo && redis,
      service: "vitacircle-api",
      mongo,
      redis: redisUrl ? redis : "unconfigured",
      ts: new Date().toISOString(),
    };
    if (!payload.ok) {
      throw new ServiceUnavailableException(payload);
    }
    return payload;
  }
}
