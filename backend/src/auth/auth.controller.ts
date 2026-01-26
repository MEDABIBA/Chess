import { Body, ConflictException, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PrismaService } from "../../prisma/prisma.service";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Post("register")
  async register(@Body() body: { username: string; password: string }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { username: body.username },
    });

    if (existingUser) {
      console.log("User already exists");
      throw new ConflictException("User already exists");
    }
    const user = await this.prisma.user.create({
      data: {
        username: body.username,
        password: body.password,
        refreshTokensHash: [],
      },
    });

    const tokens = await this.authService.generateTokenPair(user.id, user.username);
    return {
      message: "User created successfully",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Post("login")
  async login(@Body() body: { password: string; username: string }) {
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

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Post("refresh")
  async refresh(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      console.log("Refresh token required");

      throw new UnauthorizedException("Refresh token required");
    }

    const accessToken = await this.authService.refreshAccessToken(body.refreshToken);

    return {
      accessToken,
    };
  }
}
