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
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import SettingsIcon from '@mui/icons-material/Settings';
import DiscordLogo from '../images/discord-v2-svgrepo-com.svg';

import Logo from '../images/logowhite.png';

// Auth hook
import { useAuth } from '../contexts/AuthContext';

// Avatar utilities
import { isCustomAvatar, getAvatarUrl, presetAvatarInfo } from '../utils/avatarUtils';

// Accent color mapping (same as Settings/Profile)
const accentColorMap = {
	gold: '#b8860b',
	blue: '#2196f3',
	red: '#f44336',
	green: '#4caf50',
	purple: '#9c27b0',
	pink: '#e91e63',
	orange: '#ff9800',
	teal: '#009688',
	silver: '#9e9e9e',
};

// Navigation items
const pages = [
	{ name: 'Cars', path: '/home' },
	{ name: 'Tracks', path: '/tracks' },
	{ name: 'Packs', path: '/packs' },
	{ name: 'BM Cars', path: '/bm-cars' },
	{ name: 'Pack Sim', path: '/pack-simulator' },
	{ name: 'Race Sim', path: '/race-simulator' },
	{ name: 'Clicker', path: '/clicker' },
	{ name: 'Hi-Lo', path: '/higher-lower' },
];

const Navbar = () => {
	const [anchorElNav, setAnchorElNav] = React.useState(null);
	const [anchorElUser, setAnchorElUser] = React.useState(null);
	
	const { user, isAuthenticated, logout, loading } = useAuth();
	const accentColor = accentColorMap[user?.accent_color] || '#b8860b';

	const handleOpenNavMenu = (event) => {
		setAnchorElNav(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	const handleOpenUserMenu = (event) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	const handleLogout = async () => {
		handleCloseUserMenu();
		await logout();
	};

	// Get avatar display props based on user's avatar setting
	const getAvatarDisplay = () => {
		if (!user?.avatar || user.avatar === 'default') {
			// Default: show first letter
			return {
				children: user?.username?.charAt(0).toUpperCase() || '?',
			};
		}

		// Custom uploaded avatar
		if (isCustomAvatar(user.avatar)) {
			return {
				src: getAvatarUrl(user.avatar),
			};
		}

		// Preset avatar (emoji)
		const presetInfo = presetAvatarInfo[user.avatar];
		if (presetInfo) {
			return {
				children: presetInfo.icon,
				sx: { fontSize: '1.1rem' },
			};
		}

		// Fallback
		return {
			children: user?.username?.charAt(0).toUpperCase() || '?',
		};
	};

	const avatarProps = getAvatarDisplay();

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
							
							{/* Mobile auth menu items */}
							<Divider sx={{ my: 1 }} />
							{isAuthenticated ? (
								<>
									<MenuItem
										component="a"
										href={`/profile/${user?.username}`}
										onClick={handleCloseNavMenu}>
										<PersonIcon sx={{ mr: 1, fontSize: 20 }} />
										<Typography>My Profile</Typography>
									</MenuItem>
									<MenuItem
										component="a"
										href="/settings"
										onClick={handleCloseNavMenu}>
										<SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
										<Typography>Settings</Typography>
									</MenuItem>
									<MenuItem onClick={handleLogout}>
										<LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
										<Typography>Logout</Typography>
									</MenuItem>
								</>
							) : (
								<>
									<MenuItem
										component="a"
										href="/login"
										onClick={handleCloseNavMenu}>
										<LoginIcon sx={{ mr: 1, fontSize: 20 }} />
										<Typography>Login</Typography>
									</MenuItem>
									<MenuItem
										component="a"
										href="/register"
										onClick={handleCloseNavMenu}>
										<PersonIcon sx={{ mr: 1, fontSize: 20 }} />
										<Typography>Register</Typography>
									</MenuItem>
								</>
							)}
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

					{/* Auth section - Desktop */}
					<Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, mr: 2 }}>
						{loading ? (
							<Box sx={{ width: 100 }} /> // Placeholder while loading
						) : isAuthenticated ? (
							<>
								<Tooltip title="Account">
									<IconButton
										onClick={handleOpenUserMenu}
										sx={{
											p: 0.5,
											border: `2px solid ${accentColor}`,
											'&:hover': {
												backgroundColor: `${accentColor}33`,
											},
										}}
									>
										<Avatar
											{...avatarProps}
											sx={{
												width: 32,
												height: 32,
												bgcolor: accentColor,
												fontSize: '0.9rem',
												fontWeight: 'bold',
												...avatarProps.sx,
											}}
										/>
									</IconButton>
								</Tooltip>
								<Menu
									sx={{ mt: '45px' }}
									id="user-menu"
									anchorEl={anchorElUser}
									anchorOrigin={{
										vertical: 'top',
										horizontal: 'right',
									}}
									keepMounted
									transformOrigin={{
										vertical: 'top',
										horizontal: 'right',
									}}
									open={Boolean(anchorElUser)}
									onClose={handleCloseUserMenu}
								>
									<MenuItem disabled sx={{ opacity: '1 !important' }}>
										<Avatar
											{...avatarProps}
											sx={{
												width: 24,
												height: 24,
												bgcolor: accentColor,
												fontSize: '0.7rem',
												fontWeight: 'bold',
												mr: 1,
												...avatarProps.sx,
											}}
										/>
										<Typography sx={{ color: accentColor, fontWeight: 'bold' }}>
											{user?.username}
										</Typography>
									</MenuItem>
									<Divider />
									<MenuItem
										component="a"
										href={`/profile/${user?.username}`}
										onClick={handleCloseUserMenu}
									>
										<PersonIcon sx={{ mr: 1, fontSize: 20 }} />
										<Typography>My Profile</Typography>
									</MenuItem>
									<MenuItem
										component="a"
										href="/settings"
										onClick={handleCloseUserMenu}
									>
										<SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
										<Typography>Settings</Typography>
									</MenuItem>
									<Divider />
									<MenuItem onClick={handleLogout}>
										<LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
										<Typography>Logout</Typography>
									</MenuItem>
								</Menu>
							</>
						) : (
							<>
								<Button
									href="/login"
									variant="outlined"
									size="small"
									sx={{
										color: 'white',
										borderColor: 'rgba(255,255,255,0.5)',
										fontSize: '0.75rem',
										'&:hover': {
											borderColor: accentColor,
											backgroundColor: `${accentColor}1A`,
										},
									}}
								>
									Login
								</Button>
								<Button
									href="/register"
									variant="contained"
									size="small"
									sx={{
										backgroundColor: accentColor,
										color: 'white',
										fontSize: '0.75rem',
										'&:hover': {
											backgroundColor: accentColor, filter: 'brightness(0.85)',
										},
									}}
								>
									Register
								</Button>
							</>
						)}
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
