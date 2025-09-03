import jwt from "jsonwebtoken";

export interface JwtPayload {
	userId: string;
}

export class JwtUtils {
	private static readonly secret = process.env.JWT_SECRET || "fallback-secret-key";

	static generateToken(payload: JwtPayload): string {
		return jwt.sign(payload, this.secret);
	}

	static verifyToken(token: string): JwtPayload | null {
		try {
			const decoded = jwt.verify(token, this.secret) as JwtPayload;
			return decoded;
		} catch (error) {
			return null;
		}
	}
}