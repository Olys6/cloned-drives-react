import { Typography, Box, Link } from '@mui/material';
import React from 'react';

const navItems = [
	{ href: '/home', label: 'CARLIST', className: 'carlist' },
	{ href: '/tracks', label: 'TRACKLIST', className: 'tracklist' },
	{ href: '/packs', label: 'PACKLIST', className: 'packlist' },
	{ href: '/bm-cars', label: 'BLACK MARKET', className: 'bmcarlist' },
	{ href: '/pack-simulator', label: 'PACK SIM', className: 'packsim' },
	{ href: '/race-simulator', label: 'RACE SIM', className: 'racesim' },
	{ href: '/clicker', label: 'CLICKER', className: 'clicker' },
	{ href: '/higher-lower', label: 'HI-LO', className: 'higherlower' },
];

const FrontPage = () => {
	return (
		<Box sx={{ pb: 4 }}>
			<Typography
				variant='h3'
				sx={{
					fontWeight: 'bold',
					fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
					mb: { xs: 3, md: 6 },
				}}>
				WELCOME TO CLONEDDRIVES.CLUB!
			</Typography>

			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: {
						xs: 'repeat(2, 1fr)',    // Mobile: 2 columns
						sm: 'repeat(2, 1fr)',    // Small tablets: 2 columns
						md: 'repeat(3, 1fr)',    // Tablets/small desktop: 3 columns
						lg: 'repeat(3, 1fr)',    // Desktop: 3 columns
					},
					gap: { xs: '0.75rem', sm: '1rem', md: '1.5rem' },
					maxWidth: '1400px',
					margin: '0 auto',
					px: { xs: 0, sm: 2 },
				}}>
				{navItems.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className={`${item.className} frontPageItem`}
						sx={{
							borderRadius: { xs: 3, md: 4 },
							textDecoration: 'none',
							aspectRatio: '16/9',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							transition: 'transform 0.2s ease',
							'&:hover': {
								transform: { xs: 'none', md: 'scale(1.05)' },
							},
						}}>
						<Typography
							sx={{
								color: 'white',
								fontWeight: 'bold',
								fontSize: { 
									xs: '1rem',      // Mobile
									sm: '1.25rem',   // Small tablet
									md: '1.75rem',   // Tablet
									lg: '2.25rem',   // Desktop
								},
								textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
								textAlign: 'center',
								px: 1,
							}}>
							{item.label}
						</Typography>
					</Link>
				))}
			</Box>
		</Box>
	);
};

export default FrontPage;
