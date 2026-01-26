import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Socket } from "socket.io";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    try {
      const client = context.switchToWs().getClient();
      const token = this.extractToken(client);

      if (!token) {
        console.log("Token not found");
        throw new WsException("Token not found");
      }

      const payload = await this.authService.validateAccessToken(token);
      client.data.user = payload;

      return true;
    } catch (error) {
      console.log("Unauthorized");
      throw new WsException("Unauthorized");
    }
  }

  private extractToken(client: Socket): string | null {
    const tokenFromQuery = client.handshake.query.token as string;

    return tokenFromQuery || null;
  }
}
