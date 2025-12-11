import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
} from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";

interface ConfirmDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title?: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	confirmColor?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
}

export const ConfirmDialog = ({
	open,
	onClose,
	onConfirm,
	title = "Confirm Action",
	message,
	confirmText = "Confirm",
	cancelText = "Cancel",
	confirmColor = "error",
}: ConfirmDialogProps) => {
	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="xs"
			fullWidth
		>
			<DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
				<WarningIcon color={confirmColor} />
				{title}
			</DialogTitle>
			<DialogContent>
				<Typography>{message}</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color="inherit">
					{cancelText}
				</Button>
				<Button
					onClick={handleConfirm}
					variant="contained"
					color={confirmColor}
					autoFocus
				>
					{confirmText}
				</Button>
			</DialogActions>
		</Dialog>
	);
};
