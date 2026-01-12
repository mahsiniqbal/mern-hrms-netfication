import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Card,
	CardContent,
	TextField,
	Button,
	Typography,
	Alert,
	CircularProgress,
	Container,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await login(email, password);

			// Login successful, check if first login
			const savedUser = localStorage.getItem("authUser");
			if (savedUser) {
				const user = JSON.parse(savedUser);
				if (user.isFirstLogin) {
					navigate("/change-password");
				} else {
					navigate("/");
				}
			} else {
				navigate("/");
			}
		} catch (err: any) {
			console.error("Login error:", err);
			setError(
				err.response?.data?.error ||
					"Invalid email or password. Please try again."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
			}}
		>
			<Container maxWidth="sm">
				<Card
					elevation={10}
					sx={{
						borderRadius: 2,
						p: 2,
					}}
				>
					<CardContent>
						<Box sx={{ textAlign: "center", mb: 3 }}>
							<img
								src="https://netfication.com/wp-content/uploads/2024/02/2qekZP7h4ZDMJcI2zJnV8Jy6EbL.svg"
								alt="Netfication Logo"
								style={{ maxWidth: "200px", marginBottom: "16px" }}
							/>
							<Typography
								variant="h4"
								component="h1"
								gutterBottom
							>
								Welcome Back
							</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
							>
								Sign in to your account to continue
							</Typography>
						</Box>

						{error && (
							<Alert
								severity="error"
								sx={{ mb: 2 }}
							>
								{error}
							</Alert>
						)}

						<form onSubmit={handleSubmit}>
							<TextField
								fullWidth
								label="Email"
								type="email"
								value={email}
								onChange={e => setEmail(e.target.value)}
								margin="normal"
								required
								autoFocus
								disabled={loading}
							/>

							<TextField
								fullWidth
								label="Password"
								type="password"
								value={password}
								onChange={e => setPassword(e.target.value)}
								margin="normal"
								required
								disabled={loading}
							/>

							<Button
								fullWidth
								type="submit"
								variant="contained"
								size="large"
								disabled={loading}
								sx={{ mt: 3, mb: 2 }}
							>
								{loading ? (
									<CircularProgress
										size={24}
										color="inherit"
									/>
								) : (
									"Sign In"
								)}
							</Button>
						</form>

						<Typography
							variant="body2"
							color="text.secondary"
							textAlign="center"
						>
							Default password: ChangeMe123!
						</Typography>
					</CardContent>
				</Card>
			</Container>
		</Box>
	);
};

export default Login;
