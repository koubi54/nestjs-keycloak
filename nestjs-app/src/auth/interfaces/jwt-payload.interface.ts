export interface JwtPayload {
  sub: string;
  preferred_username?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: Record<string, { roles: string[] }>;
  azp?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
}
