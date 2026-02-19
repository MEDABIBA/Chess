import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "prisma/prisma.service";
import crypto from "crypto";
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}
  async generateTokenPair(id, username) {
    const refreshToken = await this.jwtService.signAsync(
      { userId: id, type: "refresh" },
      { expiresIn: "7d" },
    );
    const accessToken = await this.jwtService.signAsync(
      { userId: id, username, type: "access" },
      { expiresIn: "15m" },
    );

    return { refreshToken, accessToken };
  }

  async validateAccessToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      if (payload.type !== "access") {
        console.log("Invalid token type");
        throw new UnauthorizedException("Invalid token type");
      }
      return payload;
    } catch (err) {
      console.log("Invalid or expired access token");
      throw new UnauthorizedException("Invalid or expired access token");
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      if (payload.type !== "refresh") {
        console.log("Invalid token type");
        throw new UnauthorizedException("Invalid token type");
      }
      const refreshHash = this.hashToken(refreshToken);

      const user = await this.prisma.user.findFirst({
        where: {
          refreshTokensHash: {
            has: refreshHash,
          },
        },
      });
      if (!user) {
        console.log("Refresh token not found");
        throw new UnauthorizedException("Refresh token not found");
      }

      const newAccessToken = await this.jwtService.signAsync(
        {
          userId: user.id,
          username: user.username,
          type: "access",
        },
        { expiresIn: "15m" },
      );
      return newAccessToken;
    } catch (err) {
      console.log("Invalid token or not found");
      throw new UnauthorizedException("Invalid token or not found");
    }
  }

  hashToken(refreshToken: string): string {
    return crypto.createHash("sha256").update(refreshToken).digest("hex");
  }
}
