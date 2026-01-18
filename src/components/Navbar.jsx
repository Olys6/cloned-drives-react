import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import DiscordLogo from '../images/discord-v2-svgrepo-com.svg';

import Logo from '../images/logowhite.png';

// Navigation items
const pages = [
	{ name: 'Cars', path: '/home' },
	{ name: 'Tracks', path: '/tracks' },
	{ name: 'Packs', path: '/packs' },
	{ name: 'BM Cars', path: '/bm-cars' },
	{ name: 'Pack Sim', path: '/pack-simulator' },
	{ name: 'Race Sim', path: '/race-simulator' },
	{ name: 'Clicker', path: '/clicker' },
	{ name: 'Tune Calc', path: '/tune-calculator' },
];

const Navbar = () => {
	const [anchorElNav, setAnchorElNav] = React.useState(null);

	const handleOpenNavMenu = (event) => {
		setAnchorElNav(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	return (
		<AppBar
			position='fixed'
			sx={{
				backgroundColor: '#1a1a1a',
				borderBottom: '1px solid #333',
			}}
		>
			<Container maxWidth='xl'>
				<Toolbar disableGutters>
					<Link
						href='/'
						sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}>
						<img
							src={Logo}
							style={{ width: '14rem' }}
							alt="Cloned Drives Logo"
						/>
					</Link>

					{/* Mobile menu */}
					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
						<IconButton
							size='large'
							aria-label='navigation menu'
							aria-controls='menu-appbar'
							aria-haspopup='true'
							onClick={handleOpenNavMenu}
							color='inherit'>
							<MenuIcon />
						</IconButton>
						<Menu
							id='menu-appbar'
							anchorEl={anchorElNav}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
							open={Boolean(anchorElNav)}
							onClose={handleCloseNavMenu}
							sx={{
								display: { xs: 'block', md: 'none' },
							}}>
							{pages.map((page) => (
								<MenuItem
									key={page.name}
									onClick={handleCloseNavMenu}
									component="a"
									href={page.path}>
									<Typography textAlign='center'>{page.name}</Typography>
								</MenuItem>
							))}
						</Menu>
					</Box>

					{/* Mobile logo */}
					<Box
						sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, flexGrow: 1 }}>
						<Link href='/'>
							<img
								src={Logo}
								style={{ width: '12rem' }}
								alt="Cloned Drives Logo"
							/>
						</Link>
					</Box>

					{/* Desktop menu */}
					<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 2 }}>
						{pages.map((page) => (
							<Button
								href={page.path}
								key={page.name}
								onClick={handleCloseNavMenu}
								sx={{ 
									my: 2, 
									color: 'white', 
									display: 'block',
									fontSize: '0.8rem',
									px: 1.2,
									'&:hover': {
										backgroundColor: 'rgba(255,255,255,0.1)',
									},
								}}>
								{page.name}
							</Button>
						))}
					</Box>

					{/* Discord link */}
					<Box sx={{ display: 'flex', gap: '1rem', flexGrow: 0 }}>
						<Tooltip title="Join the Discord server!">
							<Link
								id="discordLink"
								href="https://discord.gg/p3UbVP9BxB"
								target="_blank"
								sx={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									transition: 'transform 0.2s ease, filter 0.2s ease',
									'&:hover': {
										transform: 'scale(1.1)',
										filter: 'brightness(1.2)',
									},
								}}
							>
								<img
									src={DiscordLogo}
									alt="Discord Logo"
									style={{ width: 36, borderRadius: 50 }}
								/>
							</Link>
						</Tooltip>
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
};

export default Navbar;
