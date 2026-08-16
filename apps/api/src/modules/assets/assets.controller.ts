import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { AssetsService } from "./assets.service";
import { CurrentUser, Public, type AuthUser } from "../../common/decorators/auth";

@Controller("assets")
export class AssetsController {
  constructor(private assets: AssetsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.assets.list(user);
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage(), limits: { fileSize: 80 * 1024 * 1024 } }))
  upload(@CurrentUser() user: AuthUser, @UploadedFile() file: Express.Multer.File) {
    return this.assets.upload(user, file);
  }

  @Delete(":id")
  remove(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.assets.remove(user, id);
  }

  @Public()
  @Get("raw")
  file(@Query("key") key: string) {
    return this.assets.stream(key);
  }
}
