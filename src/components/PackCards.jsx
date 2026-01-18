import React, { useState } from 'react';
import {
	Box,
	Button,
	Modal,
	Typography,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Divider,
} from '@mui/material';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

// Icons
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StyleIcon from '@mui/icons-material/Style';

const PackCards = ({
	filteredPacks,
	page,
	numOfPacks,
	packsSortType,
}) => {
	const [modalPack, setModalPack] = useState(null);
	const [open, setOpen] = useState(false);

	const handleOpen = (pack) => {
		setModalPack(pack);
		setOpen(true);
	};

	const handleClose = () => setOpen(false);

	// Rarity colors matching your bot's emoji colors
	const rarityColors = {
		mystic: '#9932CC',      // Dark purple
		legendary: '#FFD700',   // Gold
		exotic: '#FF8C00',      // Dark orange
		epic: '#9370DB',        // Medium purple
		rare: '#4169E1',        // Royal blue
		uncommon: '#32CD32',    // Lime green
		common: '#A9A9A9',      // Dark gray
		standard: '#696969',    // Dim gray
	};

	const rarityLabels = {
		mystic: '🟣 Mystic',
		legendary: '🟡 Legendary',
		exotic: '🟠 Exotic',
		epic: '🟣 Epic',
		rare: '🔵 Rare',
		uncommon: '🟢 Uncommon',
		common: '⚪ Common',
		standard: '⬜ Standard',
	};

	const formatPrice = (price) => {
		if (price === undefined) return 'Event/Daily';
		if (price === 0) return 'Event/Daily';
		return price.toLocaleString('en-US');
	};

	const getCardCount = (pack) => {
		if (!pack.packSequence) return 0;
		return pack.packSequence.length * (pack.repetition || 1);
	};

	const modalStyle = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: { md: 700, xs: '95%' },
		bgcolor: 'background.paper',
		border: '2px solid #fff',
		boxShadow: 24,
		p: 3,
		display: 'flex',
		flexDirection: 'column',
		gap: '1rem',
		borderRadius: '10px',
		maxHeight: '90vh',
		overflow: 'auto',
	};

	const sortedPacks = () => {
		return filteredPacks().sort((a, b) => {
			switch (packsSortType) {
				case 1: // Name A-Z
					return a.packName.localeCompare(b.packName);
				case 2: // Name Z-A
					return b.packName.localeCompare(a.packName);
				case 3: // Price Low to High
					return (a.price || 0) - (b.price || 0);
				case 4: // Price High to Low
					return (b.price || 0) - (a.price || 0);
				case 5: // Cards per pack
					return getCardCount(b) - getCardCount(a);
				default:
					return 0;
			}
		});
	};

	// Get active filters from pack
	const getActiveFilters = (pack) => {
		if (!pack.filter) return [];
		const active = [];
		for (const [key, value] of Object.entries(pack.filter)) {
			if (value !== 'None' && value !== null) {
				if (typeof value === 'object') {
					// Handle range filters like modelYear
					if (value.start !== undefined && value.end !== undefined) {
						if (value.start !== 1000 || value.end !== 3000) { // Skip default range
							active.push({ key, value: `${value.start}-${value.end}` });
						}
					}
				} else {
					active.push({ key, value });
				}
			}
		}
		return active;
	};

	return (
		<>
			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					gap: '1rem',
					justifyContent: 'center',
					padding: '20px',
				}}
			>
				{sortedPacks().map((pack, i) =>
					i >= numOfPacks * page - numOfPacks &&
					i < numOfPacks * page && (
						<Button
							key={i}
							onClick={() => handleOpen(pack)}
							sx={{
								display: 'flex',
								flexDirection: 'column',
								padding: 0,
								borderRadius: 2,
								overflow: 'hidden',
								backgroundColor: 'rgba(0,0,0,0.3)',
								'&:hover': {
									backgroundColor: 'rgba(0,0,0,0.5)',
									transform: 'scale(1.02)',
								},
								transition: 'all 0.2s ease',
								width: '200px',
							}}
						>
							<Box sx={{ position: 'relative', width: '200px', height: '200px' }}>
								<LazyLoadImage
									threshold={200}
									effect="blur"
									src={pack.pack}
									style={{
										width: '200px',
										height: '200px',
										objectFit: 'contain',
										backgroundColor: 'rgba(0,0,0,0.2)',
									}}
								/>
								{/* Price chip overlay */}
								<Chip
									icon={<MonetizationOnIcon sx={{ fontSize: 16 }} />}
									label={formatPrice(pack.price)}
									size="small"
									sx={{
										position: 'absolute',
										bottom: 8,
										right: 8,
										backgroundColor: pack.price ? '#4caf50' : '#9c27b0',
										color: '#fff',
										fontWeight: 'bold',
										fontSize: '0.7rem',
									}}
								/>
								{/* Card count chip */}
								<Chip
									icon={<StyleIcon sx={{ fontSize: 14 }} />}
									label={`${getCardCount(pack)} cards`}
									size="small"
									sx={{
										position: 'absolute',
										top: 8,
										right: 8,
										backgroundColor: 'rgba(0,0,0,0.7)',
										color: '#fff',
										fontSize: '0.65rem',
									}}
								/>
							</Box>
							<Typography
								sx={{
									padding: '8px',
									fontWeight: 'bold',
									fontSize: '0.8rem',
									color: '#fff',
									textAlign: 'center',
									width: '100%',
									minHeight: '50px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								{pack.packName}
							</Typography>
						</Button>
					)
				)}
			</Box>

			{/* Pack Detail Modal */}
			{modalPack && (
				<Modal
					open={open}
					onClose={handleClose}
					aria-labelledby="pack-modal-title"
				>
					<Box sx={modalStyle}>
						{/* Header with image and basic info */}
						<Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
							<Box sx={{ display: 'flex', justifyContent: 'center' }}>
								<LazyLoadImage
									src={modalPack.pack}
									style={{ 
										width: '180px', 
										height: '180px', 
										objectFit: 'contain',
										borderRadius: '8px',
										backgroundColor: 'rgba(0,0,0,0.2)',
									}}
								/>
							</Box>
							<Box sx={{ flex: 1 }}>
								<Typography variant="h5" fontWeight="bold">
									{modalPack.packName}
								</Typography>
								{modalPack.description && (
									<Typography color="text.secondary" sx={{ mt: 1 }}>
										{modalPack.description}
									</Typography>
								)}
								<Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
									<Chip
										icon={<MonetizationOnIcon />}
										label={formatPrice(modalPack.price)}
										color={modalPack.price ? 'success' : 'secondary'}
									/>
									<Chip
										icon={<StyleIcon />}
										label={`${getCardCount(modalPack)} cards`}
									/>
									{modalPack.repetition > 1 && (
										<Chip
											label={`×${modalPack.repetition} repetition`}
											variant="outlined"
										/>
									)}
								</Box>
							</Box>
						</Box>

						<Divider />

						{/* Active Filters */}
						{getActiveFilters(modalPack).length > 0 && (
							<Box>
								<Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
									Pack Filters
								</Typography>
								<Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
									{getActiveFilters(modalPack).map((filter, idx) => (
										<Chip
											key={idx}
											label={`${filter.key}: ${filter.value}`}
											size="small"
											variant="outlined"
											color="info"
										/>
									))}
								</Box>
							</Box>
						)}

						{/* Drop Rates Table */}
						{modalPack.packSequence && modalPack.packSequence.length > 0 && (
							<Box>
								<Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
									Drop Rates by Slot
								</Typography>
								<TableContainer component={Paper} sx={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
									<Table size="small">
										<TableHead>
											<TableRow>
												<TableCell sx={{ fontWeight: 'bold' }}>Slot</TableCell>
												{Object.keys(rarityColors).reverse().map(rarity => {
													// Only show column if any slot has this rarity > 0
													const hasRarity = modalPack.packSequence.some(
														slot => slot[rarity] > 0
													);
													return hasRarity ? (
														<TableCell 
															key={rarity} 
															align="center"
															sx={{ 
																fontWeight: 'bold',
																color: rarityColors[rarity],
																fontSize: '0.75rem',
															}}
														>
															{rarity.charAt(0).toUpperCase() + rarity.slice(1)}
														</TableCell>
													) : null;
												})}
											</TableRow>
										</TableHead>
										<TableBody>
											{modalPack.packSequence.map((slot, idx) => (
												<TableRow key={idx}>
													<TableCell>Card {idx + 1}</TableCell>
													{Object.keys(rarityColors).reverse().map(rarity => {
														const hasRarity = modalPack.packSequence.some(
															s => s[rarity] > 0
														);
														return hasRarity ? (
															<TableCell 
																key={rarity} 
																align="center"
																sx={{
																	color: slot[rarity] > 0 ? rarityColors[rarity] : 'text.disabled',
																	fontWeight: slot[rarity] >= 50 ? 'bold' : 'normal',
																	backgroundColor: slot[rarity] === 100 
																		? `${rarityColors[rarity]}33` 
																		: 'transparent',
																}}
															>
																{slot[rarity] > 0 ? `${slot[rarity]}%` : '-'}
															</TableCell>
														) : null;
													})}
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>
							</Box>
						)}

						{/* Pack ID */}
						<Typography variant="caption" color="text.secondary" textAlign="right">
							ID: {modalPack.packID}
						</Typography>
					</Box>
				</Modal>
			)}
		</>
	);
};

export default PackCards;
