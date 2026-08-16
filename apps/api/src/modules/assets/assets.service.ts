import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Asset, AssetDocument } from "../../schemas/content.schema";
import { User, UserDocument } from "../../schemas/user.schema";
import { StorageService } from "../../services/storage.service";
import { ScanService, sniffMime, kindFromMime } from "../../services/scan.service";
import { EntitlementsService } from "../../services/entitlements.service";
import { ALLOWED_AUDIO_MIME, ALLOWED_IMAGE_MIME, ALLOWED_VIDEO_MIME, SRS_MESSAGES } from "@vitacircle/shared";
import type { AuthUser } from "../../common/decorators/auth";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";

const IMAGE_AUDIO = [...ALLOWED_IMAGE_MIME, ...ALLOWED_AUDIO_MIME] as string[];

@Injectable()
export class AssetsService {
  constructor(
    @InjectModel(Asset.name) private assets: Model<AssetDocument>,
    @InjectModel(User.name) private users: Model<UserDocument>,
    private storage: StorageService,
    private scan: ScanService,
    private entitlements: EntitlementsService,
    private config: ConfigService,
  ) {}

  async upload(user: AuthUser, file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file provided");
    const e = this.entitlements.forUser(user);
    const owner = await this.users.findById(user.userId);
    if (!owner) throw new NotFoundException();
    if (owner.storageUsedBytes + file.size > e.storageBytes) {
      throw new BadRequestException("Storage quota exceeded");
    }
    let allowed = IMAGE_AUDIO;
    if (e.video) allowed = [...allowed, ...ALLOWED_VIDEO_MIME];
    const claimed = file.mimetype === "audio/mp3" ? "audio/mpeg" : file.mimetype;
    if (!allowed.includes(claimed)) {
      throw new BadRequestException("File type not allowed");
    }
    const sniffed = sniffMime(file.buffer, claimed);
    if (!sniffed) throw new BadRequestException("File type not allowed");
    const enabled = this.config.get("ENABLE_MALWARE_SCAN") === "true";
    const scan = await this.scan.scan(file.buffer, enabled);
    if (!scan.clean) throw new BadRequestException("File failed security scan");

    const ext = claimed === "image/png" ? "png" : claimed === "image/jpeg" ? "jpg" : claimed.startsWith("video") ? "mp4" : "mp3";
    const key = `uploads/${user.userId}/${randomUUID()}.${ext}`;
    await this.storage.putFile(key, file.buffer);
    const asset = await this.assets.create({
      ownerId: user.userId,
      key,
      mime: claimed,
      size: file.size,
      status: "ready",
      originalName: file.originalname,
      kind: kindFromMime(claimed),
    });
    owner.storageUsedBytes += file.size;
    await owner.save();
    return {
      ...asset.toObject(),
      id: asset.id,
      url: this.storage.publicUrl(key),
      message: SRS_MESSAGES.uploadSuccess,
    };
  }

  async list(user: AuthUser) {
    const items = await this.assets.find({ ownerId: user.userId, status: { $ne: "rejected" } }).sort({ createdAt: -1 });
    return items.map((a) => ({ ...a.toObject(), id: a.id, url: this.storage.publicUrl(a.key) }));
  }

  async remove(user: AuthUser, id: string) {
    const asset = await this.assets.findOne({ _id: id, ownerId: user.userId });
    if (!asset) throw new NotFoundException();
    await this.storage.remove(asset.key);
    await this.users.updateOne({ _id: user.userId }, { $inc: { storageUsedBytes: -asset.size } });
    await asset.deleteOne();
    return { ok: true };
  }

  async stream(key: string) {
    const decoded = decodeURIComponent(key);
    if (!this.storage.exists(decoded)) throw new NotFoundException();
    return new StreamableFile(this.storage.createReadStream(decoded));
  }
}
