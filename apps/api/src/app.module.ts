import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { PortfoliosModule } from "./modules/portfolios/portfolios.module";
import { AssetsModule } from "./modules/assets/assets.module";
import { AiModule } from "./modules/ai/ai.module";
import { ExportsModule } from "./modules/exports/exports.module";
import { PublishModule } from "./modules/publish/publish.module";
import { BillingModule } from "./modules/billing/billing.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { AdminModule } from "./modules/admin/admin.module";
import { PlatformModule } from "./modules/platform/platform.module";
import { ImportModule } from "./modules/import/import.module";
import { HealthController } from "./modules/health/health.controller";
import { HealthService } from "./modules/health/health.service";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ["../../.env", ".env"] }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get("MONGODB_URI") || "mongodb://127.0.0.1:27017/vitacircle",
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get("JWT_ACCESS_SECRET") || "dev-access",
        signOptions: { expiresIn: config.get("JWT_ACCESS_TTL") || "15m" },
      }),
    }),
    AuthModule,
    UsersModule,
    PortfoliosModule,
    AssetsModule,
    AiModule,
    ExportsModule,
    PublishModule,
    BillingModule,
    AnalyticsModule,
    AdminModule,
    PlatformModule,
    ImportModule,
  ],
  controllers: [HealthController],
  providers: [
    HealthService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
