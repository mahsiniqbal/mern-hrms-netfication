import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
	LinearProgress,
	Stack,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ChangePassword: React.FC = () => {
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [loading, setLoading] = useState(false);

	const { changePassword, user } = useAuth();
	const navigate = useNavigate();
	const isFirstLogin = user?.isFirstLogin || false;

	// Password strength calculation
	const calculatePasswordStrength = (password: string): number => {
		let strength = 0;
		if (password.length >= 8) strength += 25;
		if (/[a-z]/.test(password)) strength += 25;
		if (/[A-Z]/.test(password)) strength += 25;
		if (/[0-9]/.test(password)) strength += 12.5;
		if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 12.5;
		return strength;
	};

	const passwordStrength = calculatePasswordStrength(newPassword);

	const getStrengthColor = (strength: number): string => {
		if (strength < 50) return 'error';
		if (strength < 75) return 'warning';
		return 'success';
	};

	const validatePassword = (): string | null => {
		if (!oldPassword) return 'Please enter your current password';
		if (!newPassword) return 'Please enter a new password';
		if (newPassword.length < 8) return 'Password must be at least 8 characters long';
		if (!/[A-Z]/.test(newPassword)) return 'Password must contain an uppercase letter';
		if (!/[a-z]/.test(newPassword)) return 'Password must contain a lowercase letter';
		if (!/[0-9]/.test(newPassword)) return 'Password must contain a number';
		if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword))
			return 'Password must contain a special character';
		if (newPassword !== confirmPassword) return 'Passwords do not match';
		return null;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		const validationError = validatePassword();
		if (validationError) {
			setError(validationError);
			return;
		}

		setLoading(true);

		try {
			await changePassword(oldPassword, newPassword);
			setSuccess('Password changed successfully!');

			// Redirect to dashboard after a short delay
			setTimeout(() => {
				navigate('/');
			}, 1500);
		} catch (err: any) {
			console.error('Change password error:', err);
			setError(
				err.response?.data?.error ||
					'Failed to change password. Please check your old password and try again.'
			);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		if (!isFirstLogin) {
			navigate('/');
		}
	};

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: isFirstLogin
					? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
					: 'inherit',
				py: 4,
			}}
		>
			<Container maxWidth="sm">
				<Card elevation={isFirstLogin ? 10 : 3} sx={{ borderRadius: 2, p: 2 }}>
					<CardContent>
						<Box sx={{ textAlign: 'center', mb: 3 }}>
							<Typography variant="h4" component="h1" gutterBottom>
								Change Password
							</Typography>
							{isFirstLogin && (
								<Alert severity="warning" sx={{ mb: 2 }}>
									You must change your default password before continuing
								</Alert>
							)}
							<Typography variant="body2" color="text.secondary">
								{isFirstLogin
									? 'Create a strong password to secure your account'
									: 'Update your password to keep your account secure'}
							</Typography>
						</Box>

						{error && (
							<Alert severity="error" sx={{ mb: 2 }}>
								{error}
							</Alert>
						)}

						{success && (
							<Alert severity="success" sx={{ mb: 2 }}>
								{success}
							</Alert>
						)}

						<form onSubmit={handleSubmit}>
							<TextField
								fullWidth
								label="Current Password"
								type="password"
								value={oldPassword}
								onChange={(e) => setOldPassword(e.target.value)}
								margin="normal"
								required
								autoFocus
								disabled={loading}
							/>

							<TextField
								fullWidth
								label="New Password"
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								margin="normal"
								required
								disabled={loading}
							/>

							{newPassword && (
								<Box sx={{ mt: 1, mb: 1 }}>
									<Typography variant="caption" color="text.secondary">
										Password Strength
									</Typography>
									<LinearProgress
										variant="determinate"
										value={passwordStrength}
										color={getStrengthColor(passwordStrength) as any}
										sx={{ height: 8, borderRadius: 4 }}
									/>
								</Box>
							)}

							<TextField
								fullWidth
								label="Confirm New Password"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								margin="normal"
								required
								disabled={loading}
							/>

							<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
								Password must be at least 8 characters and contain uppercase, lowercase, number, and
								special character.
							</Typography>

							<Stack direction="row" spacing={2} sx={{ mt: 3 }}>
								<Button
									fullWidth
									type="submit"
									variant="contained"
									size="large"
									disabled={loading}
								>
									{loading ? (
										<CircularProgress size={24} color="inherit" />
									) : (
										'Change Password'
									)}
								</Button>

								{!isFirstLogin && (
									<Button
										fullWidth
										variant="outlined"
										size="large"
										disabled={loading}
										onClick={handleCancel}
									>
										Cancel
									</Button>
								)}
							</Stack>
						</form>
					</CardContent>
				</Card>
			</Container>
		</Box>
	);
};

export default ChangePassword;
