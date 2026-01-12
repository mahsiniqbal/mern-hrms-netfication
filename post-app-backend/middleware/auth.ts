import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface AuthRequest extends Request {
	user?: {
		userId: number;
		email: string;
		role: 'admin' | 'user';
		empName: string;
	};
}

export const authenticateToken = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): void => {
	try {
		// Extract token from Authorization header
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.startsWith('Bearer ')
			? authHeader.substring(7)
			: null;

		if (!token) {
			res.status(401).json({ error: 'Access denied. No token provided.' });
			return;
		}

		// Verify token
		const decoded = jwt.verify(token, JWT_SECRET) as {
			userId: number;
			email: string;
			role: 'admin' | 'user';
			empName: string;
		};

		// Attach user info to request
		req.user = decoded;
		next();
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			res.status(401).json({ error: 'Token expired.' });
		} else if (error instanceof jwt.JsonWebTokenError) {
			res.status(401).json({ error: 'Invalid token.' });
		} else {
			res.status(500).json({ error: 'Internal server error.' });
		}
	}
};
