import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';

export interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  'not-before-policy'?: number;
  session_state?: string;
  scope?: string;
}

@Injectable()
export class AuthService {
  private readonly tokenUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private readonly config: ConfigService) {
    const keycloakUrl = this.config.getOrThrow<string>('KEYCLOAK_URL');
    const realm = this.config.getOrThrow<string>('KEYCLOAK_REALM');
    this.tokenUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;
    this.clientId = this.config.getOrThrow<string>('KEYCLOAK_CLIENT_ID');
    this.clientSecret = this.config.getOrThrow<string>('KEYCLOAK_CLIENT_SECRET');
  }

  async login(dto: LoginDto): Promise<KeycloakTokenResponse> {
    if (!dto.username?.trim() || !dto.password) {
      throw new BadRequestException('username and password are required');
    }

    return this.requestToken({
      grant_type: 'password',
      username: dto.username,
      password: dto.password,
    });
  }

  async refresh(refreshToken: string): Promise<KeycloakTokenResponse> {
    if (!refreshToken?.trim()) {
      throw new BadRequestException('refresh_token is required');
    }

    return this.requestToken({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
  }

  private async requestToken(
    params: Record<string, string>,
  ): Promise<KeycloakTokenResponse> {
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      ...params,
    });

    let response: Response;
    try {
      response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
    } catch {
      throw new UnauthorizedException('Unable to reach Keycloak');
    }

    const data = (await response.json()) as KeycloakTokenResponse & {
      error?: string;
      error_description?: string;
    };

    if (!response.ok || !data.access_token) {
      throw new UnauthorizedException(
        data.error_description || data.error || 'Invalid credentials',
      );
    }

    return data;
  }
}
