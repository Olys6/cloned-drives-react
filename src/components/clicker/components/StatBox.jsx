import { Paper, Box, Typography } from '@mui/material';

const StatBox = ({ icon, label, value, color = '#fff', small = false }) => (
	<Paper sx={{ 
		p: small ? { xs: '4px 6px', sm: 1 } : 1.5, 
		display: 'flex', 
		alignItems: 'center', 
		gap: small ? { xs: 0.5, sm: 1 } : 1,
		backgroundColor: 'rgba(0,0,0,0.3)',
		minWidth: small ? { xs: 0, sm: 100 } : 120,
		flexShrink: 0,
		'& .MuiSvgIcon-root': small ? {
			fontSize: { xs: '0.9rem', sm: '1.25rem' },
		} : {},
	}}>
		{icon}
		<Box>
			<Typography variant="caption" color="text.secondary" sx={{ fontSize: small ? { xs: '0.55rem', sm: '0.65rem' } : '0.75rem', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
				{label}
			</Typography>
			<Typography variant={small ? "body2" : "body1"} fontWeight="bold" sx={{ color, fontSize: small ? { xs: '0.7rem', sm: '0.875rem' } : undefined, whiteSpace: 'nowrap', lineHeight: 1.2 }}>
				{value}
			</Typography>
		</Box>
	</Paper>
);

export default StatBox;
