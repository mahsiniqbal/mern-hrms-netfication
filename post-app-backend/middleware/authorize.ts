import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

// Middleware to require admin role
export const requireAdmin = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): void => {
	if (!req.user) {
		res.status(401).json({ error: 'Authentication required.' });
		return;
	}

	if (req.user.role !== 'admin') {
		res.status(403).json({ error: 'Access denied. Admin privileges required.' });
		return;
	}

	next();
};

// Helper function to get data filter based on user role
export const getDataFilter = (user: AuthRequest['user']): object => {
	if (!user) {
		return {};
	}

	// Admin sees all data (no filter)
	if (user.role === 'admin') {
		return {};
	}

	// Regular user sees only their own data (filter by employeeId)
	return { employeeId: user.userId };
};
