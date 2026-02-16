import {
  Body,
  ConflictException,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PrismaService } from "../../prisma/prisma.service";
import type { Request, Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post("registration")
  async register(
    @Body() body: { username: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: body.username },
    });

    if (existingUser) {
      console.log("User already exists");
      throw new ConflictException("User already exists");
    }
    const user = await this.prisma.user.create({
      data: { username: body.username, password: body.password, refreshTokensHash: [] },
    });

    const tokens = await this.authService.generateTokenPair(user.id, body.username);
    const refreshHash = this.authService.hashToken(tokens.refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokensHash: { push: refreshHash },
      },
    });

    response.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true, // JS cant read
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }); // 7 days
    return {
      message: "User created successfully",
      accessToken: tokens.accessToken,
    };
  }

  @Post("login")
  async login(
    @Body() body: { password: string; username: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { username: body.username },
    });

    if (!user) {
      console.log("User not found");
      throw new UnauthorizedException("User not found");
    }

    const isPasswordValid = body.password === user.password;
    if (!isPasswordValid) {
      console.log("Invalid password");
      throw new UnauthorizedException("Invalid password");
    }
    const tokens = await this.authService.generateTokenPair(user.id, user.username);
    const refreshHash = this.authService.hashToken(tokens.refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokensHash: { push: refreshHash },
      },
    });
    response.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true, // JS cant read
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
      sameSite: "lax",
    }); // 7 days
    return {
      accessToken: tokens.accessToken,
    };
  }

  @Post("refresh")
  async refresh(@Req() requset: Request) {
    console.log("=== REFRESH ACCESS TOKEN CALLED ===");
    console.log("All cookies:", requset.cookies);

    const refreshToken = requset.cookies["refreshToken"];
    if (!refreshToken) {
      console.log("Refresh token required");
      throw new UnauthorizedException("Refresh token required");
    }

    const accessToken = await this.authService.refreshAccessToken(refreshToken);

    return {
      accessToken,
    };
  }
}
