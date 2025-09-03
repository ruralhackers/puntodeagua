import type { JWTPayload } from '@elysiajs/jwt';

export interface JwtPayload extends JWTPayload {
  userId: string;
  email: string;
  roles: string[];
}

export class JwtService {
  static readonly ID = "JwtService";
  
  constructor(private readonly secret: string) {}

  async sign(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
    // This will be implemented in the API layer using Elysia's JWT plugin
    // since it needs access to the Elysia JWT instance
    throw new Error("JWT signing must be implemented in the infrastructure layer");
  }

  async verify(token: string): Promise<JwtPayload> {
    // This will be implemented in the API layer using Elysia's JWT plugin
    throw new Error("JWT verification must be implemented in the infrastructure layer");
  }
}