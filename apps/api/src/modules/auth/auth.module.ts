import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { User, UserSchema } from "../../schemas/user.schema";
import { Session, SessionSchema } from "../../schemas/session.schema";
import { MailService } from "../../services/mail.service";
import { GoogleStrategy } from "./google.strategy";
import { LinkedInStrategy } from "./linkedin.strategy";

@Module({
  imports: [
    PassportModule.register({ session: false }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get("JWT_ACCESS_SECRET") || "dev-access",
        signOptions: { expiresIn: config.get("JWT_ACCESS_TTL") || "15m" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, GoogleStrategy, LinkedInStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
