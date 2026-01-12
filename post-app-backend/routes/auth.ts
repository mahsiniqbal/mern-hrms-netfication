import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Emp from "../models/Emp";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = express.Router();
const JWT_SECRET = (process.env.JWT_SECRET || "fallback-secret-key") as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as string;

// POST /api/auth/login - Login endpoint
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		// Validate input
		if (!email || !password) {
			res.status(400).json({ error: "Email and password are required." });
			return;
		}

		// Find user by email (explicitly select password field)
		const user = await Emp.findOne({ email }).select("+password");
		if (!user) {
			res.status(401).json({ error: "Invalid credentials." });
			return;
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			res.status(401).json({ error: "Invalid credentials." });
			return;
		}

		// Generate JWT token
		const token = jwt.sign(
			{
				userId: user.id,
				email: user.email,
				role: user.role,
				empName: user.empName,
			},
			JWT_SECRET as jwt.Secret,
			{ expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
		);

		// Return token and user info (without password)
		res.json({
			token,
			user: {
				id: user.id,
				email: user.email,
				empName: user.empName,
				role: user.role,
				isFirstLogin: user.isFirstLogin,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Internal server error." });
	}
});

// POST /api/auth/change-password - Change password endpoint
router.post(
	"/change-password",
	authenticateToken,
	async (req: AuthRequest, res) => {
		try {
			const { oldPassword, newPassword } = req.body;
			const userId = req.user?.userId;

			// Validate input
			if (!oldPassword || !newPassword) {
				res
					.status(400)
					.json({ error: "Old password and new password are required." });
				return;
			}

			// Validate new password strength
			if (newPassword.length < 8) {
				res
					.status(400)
					.json({ error: "New password must be at least 8 characters long." });
				return;
			}

			const hasUpperCase = /[A-Z]/.test(newPassword);
			const hasLowerCase = /[a-z]/.test(newPassword);
			const hasNumber = /[0-9]/.test(newPassword);
			const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

			if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
				res.status(400).json({
					error:
						"Password must contain uppercase, lowercase, number, and special character.",
				});
				return;
			}

			// Find user by ID (explicitly select password field)
			const user = await Emp.findOne({ id: userId }).select("+password");
			if (!user) {
				res.status(404).json({ error: "User not found." });
				return;
			}

			// Verify old password
			const isOldPasswordValid = await bcrypt.compare(
				oldPassword,
				user.password
			);
			if (!isOldPasswordValid) {
				res.status(400).json({ error: "Old password is incorrect." });
				return;
			}

			// Hash new password
			const hashedPassword = await bcrypt.hash(newPassword, 10);

			// Update password and set isFirstLogin to false
			user.password = hashedPassword;
			user.isFirstLogin = false;
			user.passwordLastChanged = new Date();
			await user.save();

			res.json({ message: "Password changed successfully." });
		} catch (error) {
			console.error("Change password error:", error);
			res.status(500).json({ error: "Internal server error." });
		}
	}
);

// GET /api/auth/me - Get current user profile
router.get("/me", authenticateToken, async (req: AuthRequest, res) => {
	try {
		const userId = req.user?.userId;

		// Find user by ID
		const user = await Emp.findOne({ id: userId });
		if (!user) {
			res.status(404).json({ error: "User not found." });
			return;
		}

		// Return user profile (without password)
		res.json({
			id: user.id,
			email: user.email,
			empName: user.empName,
			role: user.role,
			isFirstLogin: user.isFirstLogin,
			position: user.position,
			department: user.department,
			hireDate: user.hireDate,
		});
	} catch (error) {
		console.error("Get user profile error:", error);
		res.status(500).json({ error: "Internal server error." });
	}
});

export default router;
