import React, { useState } from 'react';
import {
	Box,
	Button,
	Modal,
	Typography,
	Chip,
	Divider,
} from '@mui/material';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

// Icons
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const BMCarCards = ({
	filteredCars,
	page,
	numOfCars,
	sortType,
	allCarData,
}) => {
	const [modalCar, setModalCar] = useState(null);
	const [referenceCar, setReferenceCar] = useState(null);
	const [open, setOpen] = useState(false);

	const handleOpen = (car) => {
		setModalCar(car);
		// Find the referenced car
		const refCar = allCarData.find(c => c.carID === car.reference);
		setReferenceCar(refCar || null);
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setModalCar(null);
		setReferenceCar(null);
	};

	const modalStyle = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: { md: 650, xs: '95%' },
		bgcolor: 'background.paper',
		border: '2px solid #9c27b0',
		boxShadow: '0 0 20px rgba(156, 39, 176, 0.5)',
		p: 3,
		display: 'flex',
		flexDirection: 'column',
		gap: '1rem',
		borderRadius: '10px',
		maxHeight: '90vh',
		overflow: 'auto',
	};

	const sortedCars = () => {
		return filteredCars().sort((a, b) => {
			switch (sortType) {
				case 1: // Name A-Z
					return a.model.localeCompare(b.model);
				case 2: // Name Z-A
					return b.model.localeCompare(a.model);
				case 3: // Collection A-Z
					const collA = Array.isArray(a.collection) ? a.collection[0] : (a.collection || 'ZZZ');
					const collB = Array.isArray(b.collection) ? b.collection[0] : (b.collection || 'ZZZ');
					return collA.localeCompare(collB);
				case 4: // Car ID
					return a.carID.localeCompare(b.carID);
				default:
					return 0;
			}
		});
	};

	const getCollectionColor = (collection) => {
		// Generate consistent color based on collection name
		const colors = [
			'#9c27b0', '#673ab7', '#3f51b5', '#2196f3', 
			'#009688', '#4caf50', '#ff9800', '#f44336',
			'#e91e63', '#00bcd4', '#8bc34a', '#ffc107'
		];
		if (!collection) return colors[0];
		const str = Array.isArray(collection) ? collection[0] : collection;
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
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
				{sortedCars().map((car, i) =>
					i >= numOfCars * page - numOfCars &&
					i < numOfCars * page && (
						<Button
							key={i}
							onClick={() => handleOpen(car)}
							sx={{
								display: 'flex',
								flexDirection: 'column',
								padding: 0,
								borderRadius: 2,
								overflow: 'hidden',
								backgroundColor: 'rgba(156, 39, 176, 0.1)',
								border: '1px solid rgba(156, 39, 176, 0.3)',
								'&:hover': {
									backgroundColor: 'rgba(156, 39, 176, 0.2)',
									transform: 'scale(1.02)',
									borderColor: '#9c27b0',
								},
								transition: 'all 0.2s ease',
							}}
						>
							<Box sx={{ position: 'relative', width: '240px' }}>
								<LazyLoadImage
									threshold={200}
									effect="blur"
									src={car.racehud}
									style={{
										width: '240px',
										height: '150px',
										objectFit: 'cover',
									}}
								/>
								{/* Active status indicator */}
								<Box
									sx={{
										position: 'absolute',
										top: 8,
										right: 8,
									}}
								>
									{car.active === true ? (
										<Chip
											icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
											label="Active"
											size="small"
											sx={{
												backgroundColor: '#4caf50',
												color: '#fff',
												fontSize: '0.65rem',
											}}
										/>
									) : (
										<Chip
											icon={<CancelIcon sx={{ fontSize: 14 }} />}
											label="Inactive"
											size="small"
											sx={{
												backgroundColor: '#757575',
												color: '#fff',
												fontSize: '0.65rem',
											}}
										/>
									)}
								</Box>
								{/* Collection chip */}
								{car.collection && (
									<Box
										sx={{
											position: 'absolute',
											bottom: 8,
											left: 8,
											right: 8,
										}}
									>
										<Chip
											label={Array.isArray(car.collection) ? car.collection[0] : car.collection}
											size="small"
											sx={{
												backgroundColor: getCollectionColor(car.collection),
												color: '#fff',
												fontWeight: 'bold',
												fontSize: '0.65rem',
												maxWidth: '100%',
												'& .MuiChip-label': {
													overflow: 'hidden',
													textOverflow: 'ellipsis',
												}
											}}
										/>
									</Box>
								)}
							</Box>
							<Typography
								sx={{
									padding: '8px',
									fontWeight: 'bold',
									fontSize: '0.8rem',
									color: '#fff',
									textAlign: 'center',
									width: '100%',
								}}
							>
								{car.model}
							</Typography>
						</Button>
					)
				)}
			</Box>

			{/* BM Car Detail Modal */}
			{modalCar && (
				<Modal
					open={open}
					onClose={handleClose}
					aria-labelledby="bm-car-modal-title"
				>
					<Box sx={modalStyle}>
						{/* Car Image */}
						<Box sx={{ position: 'relative' }}>
							<LazyLoadImage
								src={modalCar.racehud}
								style={{ width: '100%', borderRadius: '8px' }}
							/>
							{/* Active status */}
							<Box sx={{ position: 'absolute', top: 10, right: 10 }}>
								{modalCar.active === true ? (
									<Chip
										icon={<CheckCircleIcon />}
										label="Active"
										color="success"
									/>
								) : (
									<Chip
										icon={<CancelIcon />}
										label="Inactive"
										sx={{ backgroundColor: '#757575', color: '#fff' }}
									/>
								)}
							</Box>
						</Box>

						{/* Car Name */}
						<Typography variant="h5" fontWeight="bold" textAlign="center">
							{Array.isArray(modalCar.make) ? modalCar.make[0] : modalCar.make} {modalCar.model}
						</Typography>

						{/* Model Year */}
						{modalCar.modelYear && (
							<Typography variant="subtitle1" textAlign="center" color="text.secondary">
								{modalCar.modelYear}
							</Typography>
						)}

						{/* Collection Tags */}
						{modalCar.collection && (
							<Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
								{(Array.isArray(modalCar.collection) ? modalCar.collection : [modalCar.collection]).map((coll, idx) => (
									<Chip
										key={idx}
										label={coll}
										sx={{
											backgroundColor: getCollectionColor(coll),
											color: '#fff',
											fontWeight: 'bold',
										}}
									/>
								))}
							</Box>
						)}

						{/* Description */}
						{modalCar.description && modalCar.description !== 'placeholder desc' && (
							<Typography color="text.secondary" textAlign="center" sx={{ fontStyle: 'italic' }}>
								"{modalCar.description}"
							</Typography>
						)}

						<Divider />

						{/* Reference Car Info */}
						{referenceCar && (
							<Box>
								<Typography variant="h6" fontWeight="bold" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
									<LinkIcon /> Base Car Stats
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
									Referenced from: {Array.isArray(referenceCar.make) ? referenceCar.make[0] : referenceCar.make} {referenceCar.model}
								</Typography>
								
								<Box sx={{ 
									display: 'grid', 
									gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
									gap: 2 
								}}>
									<Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
										<Typography variant="caption" color="text.secondary">Top Speed</Typography>
										<Typography variant="h6" fontWeight="bold">{referenceCar.topSpeed}</Typography>
									</Box>
									<Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
										<Typography variant="caption" color="text.secondary">0-60</Typography>
										<Typography variant="h6" fontWeight="bold">{referenceCar['0to60']}</Typography>
									</Box>
									<Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
										<Typography variant="caption" color="text.secondary">Handling</Typography>
										<Typography variant="h6" fontWeight="bold">{referenceCar.handling}</Typography>
									</Box>
									<Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
										<Typography variant="caption" color="text.secondary">CR</Typography>
										<Typography variant="h6" fontWeight="bold">{referenceCar.cr}</Typography>
									</Box>
								</Box>

								<Box sx={{ 
									display: 'grid', 
									gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
									gap: 2,
									mt: 2
								}}>
									<Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
										<Typography variant="caption" color="text.secondary">Drive</Typography>
										<Typography variant="body1" fontWeight="bold">{referenceCar.driveType}</Typography>
									</Box>
									<Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
										<Typography variant="caption" color="text.secondary">Tyres</Typography>
										<Typography variant="body1" fontWeight="bold">{referenceCar.tyreType}</Typography>
									</Box>
									<Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
										<Typography variant="caption" color="text.secondary">Weight</Typography>
										<Typography variant="body1" fontWeight="bold">{referenceCar.weight}kg</Typography>
									</Box>
									<Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
										<Typography variant="caption" color="text.secondary">GC</Typography>
										<Typography variant="body1" fontWeight="bold">{referenceCar.gc}</Typography>
									</Box>
								</Box>
							</Box>
						)}

						{/* Footer Info */}
						<Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
							<Typography variant="caption" color="text.secondary">
								Creator: {modalCar.creator}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								ID: {modalCar.carID} → {modalCar.reference}
							</Typography>
						</Box>
					</Box>
				</Modal>
			)}
		</>
	);
};

export default BMCarCards;
