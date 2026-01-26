import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}
  async generateTokenPair() {}

  async validateAccessToken() {}

  async refreshAccessToken() {}

  private hashToken() {}
}
