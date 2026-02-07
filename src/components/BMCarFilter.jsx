import { useState, useMemo } from 'react';
import {
	TextField,
	Select,
	MenuItem,
	Box,
	Stack,
	Accordion,
	AccordionSummary,
	Typography,
	AccordionDetails,
	InputLabel,
	FormControl,
	Autocomplete,
	Badge,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';

// ============================================================
// COUNTRIES - full list (same as CarFilter.jsx)
// ============================================================
const ALL_COUNTRIES = [
	{ code: 'AD', label: 'Andorra' },{ code: 'AE', label: 'United Arab Emirates' },
	{ code: 'AF', label: 'Afghanistan' },{ code: 'AG', label: 'Antigua and Barbuda' },
	{ code: 'AL', label: 'Albania' },{ code: 'AM', label: 'Armenia' },
	{ code: 'AO', label: 'Angola' },{ code: 'AR', label: 'Argentina' },
	{ code: 'AT', label: 'Austria' },{ code: 'AU', label: 'Australia' },
	{ code: 'AZ', label: 'Azerbaijan' },{ code: 'BA', label: 'Bosnia and Herzegovina' },
	{ code: 'BB', label: 'Barbados' },{ code: 'BD', label: 'Bangladesh' },
	{ code: 'BE', label: 'Belgium' },{ code: 'BG', label: 'Bulgaria' },
	{ code: 'BH', label: 'Bahrain' },{ code: 'BN', label: 'Brunei Darussalam' },
	{ code: 'BO', label: 'Bolivia' },{ code: 'BR', label: 'Brazil' },
	{ code: 'BS', label: 'Bahamas' },{ code: 'BW', label: 'Botswana' },
	{ code: 'BY', label: 'Belarus' },{ code: 'CA', label: 'Canada' },
	{ code: 'CH', label: 'Switzerland' },{ code: 'CL', label: 'Chile' },
	{ code: 'CN', label: 'China' },{ code: 'CO', label: 'Colombia' },
	{ code: 'CR', label: 'Costa Rica' },{ code: 'CU', label: 'Cuba' },
	{ code: 'CY', label: 'Cyprus' },{ code: 'CZ', label: 'Czech Republic' },
	{ code: 'DE', label: 'Germany' },{ code: 'DK', label: 'Denmark' },
	{ code: 'DO', label: 'Dominican Republic' },{ code: 'DZ', label: 'Algeria' },
	{ code: 'EC', label: 'Ecuador' },{ code: 'EE', label: 'Estonia' },
	{ code: 'EG', label: 'Egypt' },{ code: 'ES', label: 'Spain' },
	{ code: 'ET', label: 'Ethiopia' },{ code: 'FI', label: 'Finland' },
	{ code: 'FR', label: 'France' },{ code: 'GB', label: 'United Kingdom' },
	{ code: 'GE', label: 'Georgia' },{ code: 'GH', label: 'Ghana' },
	{ code: 'GR', label: 'Greece' },{ code: 'GT', label: 'Guatemala' },
	{ code: 'HK', label: 'Hong Kong' },{ code: 'HN', label: 'Honduras' },
	{ code: 'HR', label: 'Croatia' },{ code: 'HU', label: 'Hungary' },
	{ code: 'ID', label: 'Indonesia' },{ code: 'IE', label: 'Ireland' },
	{ code: 'IL', label: 'Israel' },{ code: 'IN', label: 'India' },
	{ code: 'IQ', label: 'Iraq' },{ code: 'IR', label: 'Iran' },
	{ code: 'IS', label: 'Iceland' },{ code: 'IT', label: 'Italy' },
	{ code: 'JM', label: 'Jamaica' },{ code: 'JO', label: 'Jordan' },
	{ code: 'JP', label: 'Japan' },{ code: 'KE', label: 'Kenya' },
	{ code: 'KG', label: 'Kyrgyzstan' },{ code: 'KH', label: 'Cambodia' },
	{ code: 'KR', label: 'South Korea' },{ code: 'KW', label: 'Kuwait' },
	{ code: 'KZ', label: 'Kazakhstan' },{ code: 'LA', label: 'Laos' },
	{ code: 'LB', label: 'Lebanon' },{ code: 'LI', label: 'Liechtenstein' },
	{ code: 'LK', label: 'Sri Lanka' },{ code: 'LT', label: 'Lithuania' },
	{ code: 'LU', label: 'Luxembourg' },{ code: 'LV', label: 'Latvia' },
	{ code: 'LY', label: 'Libya' },{ code: 'MA', label: 'Morocco' },
	{ code: 'MC', label: 'Monaco' },{ code: 'MD', label: 'Moldova' },
	{ code: 'ME', label: 'Montenegro' },{ code: 'MG', label: 'Madagascar' },
	{ code: 'MK', label: 'North Macedonia' },{ code: 'MM', label: 'Myanmar' },
	{ code: 'MN', label: 'Mongolia' },{ code: 'MO', label: 'Macao' },
	{ code: 'MT', label: 'Malta' },{ code: 'MU', label: 'Mauritius' },
	{ code: 'MX', label: 'Mexico' },{ code: 'MY', label: 'Malaysia' },
	{ code: 'MZ', label: 'Mozambique' },{ code: 'NA', label: 'Namibia' },
	{ code: 'NG', label: 'Nigeria' },{ code: 'NI', label: 'Nicaragua' },
	{ code: 'NL', label: 'Netherlands' },{ code: 'NO', label: 'Norway' },
	{ code: 'NP', label: 'Nepal' },{ code: 'NZ', label: 'New Zealand' },
	{ code: 'OM', label: 'Oman' },{ code: 'PA', label: 'Panama' },
	{ code: 'PE', label: 'Peru' },{ code: 'PH', label: 'Philippines' },
	{ code: 'PK', label: 'Pakistan' },{ code: 'PL', label: 'Poland' },
	{ code: 'PR', label: 'Puerto Rico' },{ code: 'PT', label: 'Portugal' },
	{ code: 'PY', label: 'Paraguay' },{ code: 'QA', label: 'Qatar' },
	{ code: 'RO', label: 'Romania' },{ code: 'RS', label: 'Serbia' },
	{ code: 'RU', label: 'Russia' },{ code: 'RW', label: 'Rwanda' },
	{ code: 'SA', label: 'Saudi Arabia' },{ code: 'SE', label: 'Sweden' },
	{ code: 'SG', label: 'Singapore' },{ code: 'SI', label: 'Slovenia' },
	{ code: 'SK', label: 'Slovakia' },{ code: 'SN', label: 'Senegal' },
	{ code: 'SV', label: 'El Salvador' },{ code: 'SY', label: 'Syria' },
	{ code: 'TH', label: 'Thailand' },{ code: 'TN', label: 'Tunisia' },
	{ code: 'TR', label: 'Turkey' },{ code: 'TT', label: 'Trinidad and Tobago' },
	{ code: 'TW', label: 'Taiwan' },{ code: 'TZ', label: 'Tanzania' },
	{ code: 'UA', label: 'Ukraine' },{ code: 'UG', label: 'Uganda' },
	{ code: 'US', label: 'United States' },{ code: 'UY', label: 'Uruguay' },
	{ code: 'UZ', label: 'Uzbekistan' },{ code: 'VE', label: 'Venezuela' },
	{ code: 'VN', label: 'Vietnam' },{ code: 'XK', label: 'Kosovo' },
	{ code: 'ZA', label: 'South Africa' },{ code: 'ZM', label: 'Zambia' },
	{ code: 'ZW', label: 'Zimbabwe' },
];

// ============================================================
// REUSABLE RANGE INPUT (same as CarFilter.jsx)
// ============================================================
const RangeInput = ({ label, value, onChange, placeholderMin, placeholderMax, active, accentColor, sx = {} }) => (
	<Box
		sx={{
			width: '100%',
			borderRadius: '6px',
			padding: active ? '4px' : 0,
			transition: 'box-shadow 0.2s ease, padding 0.2s ease',
			boxShadow: active ? `0 0 10px 1px ${accentColor}55, inset 0 0 6px ${accentColor}22` : 'none',
			border: active ? `1px solid ${accentColor}88` : '1px solid transparent',
			...sx,
		}}>
		<Stack direction='row' gap={1} alignItems='center'>
			<Typography sx={{
				flexShrink: 0,
				minWidth: '4rem',
				fontSize: '0.85rem',
				color: active ? accentColor : 'text.secondary',
				fontWeight: active ? 'bold' : 'normal',
				transition: 'color 0.2s ease',
			}}>
				{label}
			</Typography>
			<TextField
				size='small'
				type='number'
				placeholder={placeholderMin || 'Min'}
				inputProps={{ inputMode: 'numeric' }}
				onChange={e => onChange([e.target.value, value[1]])}
				value={value[0]}
				sx={{ flex: 1 }}
			/>
			<Typography sx={{ color: 'text.secondary', px: 0.25 }}>-</Typography>
			<TextField
				size='small'
				type='number'
				placeholder={placeholderMax || 'Max'}
				onChange={e => onChange([value[0], e.target.value])}
				value={value[1]}
				sx={{ flex: 1 }}
			/>
		</Stack>
	</Box>
);

// ============================================================
// COMPONENT
// ============================================================
const BMCarFilter = ({
	accentColor = '#b8860b',
	bounds,
	search, setSearch,
	sortType, setSortType,
	numOfCars, setNumOfCars,
	collection, setCollection,
	collectionOptions,
	creator, setCreator,
	creatorOptions,
	activeFilter, setActiveFilter,
	crRange, setCrRange,
	carMake, setCarMake,
	makeOptions,
	carCountryValue, setCarCountryValue,
	setPage,
}) => {
	const [expandedPanels, setExpandedPanels] = useState(new Set());

	const togglePanel = (panel) => (_event, isExpanded) => {
		setExpandedPanels(prev => {
			const next = new Set(prev);
			if (isExpanded) next.add(panel);
			else next.delete(panel);
			return next;
		});
	};

	// Filter available countries to only those in BM data
	// (countryCodes comes from bmStaticOptions via BMCarList but isn't passed;
	//  we derive from makeOptions parent - we'll filter via the options)
	// Actually we receive carCountryValue but need the full list filtered.
	// We'll compute from the BM car data that's already imported.
	// Since we can't import bmCarData here, we filter ALL_COUNTRIES to only
	// those that appear in BM cars. We do this by checking if any option
	// in makeOptions corresponds. But simpler: just show all countries and
	// let the filter handle no-matches gracefully. Actually let's just
	// accept it as a prop from BMCarList for consistency.

	// For countries, we filter ALL_COUNTRIES. Since we don't have countryCodes
	// as a prop, we derive from carData. But to keep it clean we just
	// show all countries - the autocomplete search makes this usable.
	// The filtered set comes from the BM data in BMCarList via the filter logic.

	// Shared sx
	const textFieldAccentSx = {
		'& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: accentColor },
		'& .MuiInputLabel-root.Mui-focused': { color: accentColor },
	};

	const glowSx = (isActive) => isActive ? {
		borderRadius: '6px',
		boxShadow: `0 0 10px 1px ${accentColor}55, inset 0 0 6px ${accentColor}22`,
		'& .MuiOutlinedInput-notchedOutline': {
			borderColor: `${accentColor}88 !important`,
		},
		'& .MuiInputLabel-root': {
			color: `${accentColor} !important`,
			fontWeight: 'bold',
		},
	} : {};

	const isRangeActive = (val, min, max) =>
		Number(val[0]) !== min || Number(val[1]) !== max;

	// Active filter counts per panel
	const panel1Active = useMemo(() => {
		let n = 0;
		if (isRangeActive(crRange, bounds.minCr, bounds.maxCr)) n++;
		if (carMake.length > 0) n++;
		if (carCountryValue.length > 0) n++;
		return n;
	}, [crRange, carMake, carCountryValue, bounds]);

	const panel2Active = useMemo(() => {
		let n = 0;
		if (collection.length > 0) n++;
		if (creator.length > 0) n++;
		if (activeFilter !== 'all') n++;
		return n;
	}, [collection, creator, activeFilter]);

	const FilterBadge = ({ count, children }) => (
		<Badge
			badgeContent={count}
			sx={{
				'& .MuiBadge-badge': {
					bgcolor: accentColor,
					color: '#fff',
					fontWeight: 'bold',
					fontSize: '0.7rem',
				},
			}}
			invisible={count === 0}>
			{children}
		</Badge>
	);

	const accordionHeaderSx = {
		'&.Mui-expanded': { borderBottom: `2px solid ${accentColor}` },
	};

	const rowSx = {
		mb: 1.5,
		width: { xs: '100%', md: '98%' },
		display: 'flex',
		flexDirection: { xs: 'column', md: 'row' },
		gap: 2,
	};

	return (
		<Box id='searchBox'>
			{/* =============================================
			    ALWAYS VISIBLE - Search + Sort
			    ============================================= */}
			<Box
				sx={{
					width: { xs: '100%', md: '98%' },
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					alignItems: 'center',
					gap: 2,
					mb: 1,
				}}>
				<TextField
					fullWidth
					color='secondary'
					label='Search BM cars'
					variant='outlined'
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						setPage(1);
					}}
					placeholder='Search by name, make, or car ID'
					InputProps={{
						startAdornment: (
							<SearchIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
						),
					}}
					sx={{ ...textFieldAccentSx, ...glowSx(search.length > 0) }}
				/>
				<FormControl sx={{ minWidth: { xs: '100%', md: 220 } }}>
					<InputLabel>Sort</InputLabel>
					<Select
						value={sortType}
						onChange={e => setSortType(e.target.value)}
						label='Sort'>
						<MenuItem value={1}>Name (A-Z)</MenuItem>
						<MenuItem value={2}>Name (Z-A)</MenuItem>
						<MenuItem value={3}>Collection (A-Z)</MenuItem>
						<MenuItem value={4}>Car ID</MenuItem>
					</Select>
				</FormControl>
			</Box>

			{/* =============================================
			    PANEL 1 - CR / Make / Country
			    ============================================= */}
			<Accordion
				TransitionProps={{ unmountOnExit: true }}
				sx={{ width: { xs: '100%', md: '98%' } }}
				expanded={expandedPanels.has('panel1')}
				onChange={togglePanel('panel1')}>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionHeaderSx}>
					<FilterBadge count={panel1Active}>
						<Typography>CR / Make / Country</Typography>
					</FilterBadge>
				</AccordionSummary>
				<AccordionDetails>
					{/* Row 1: CR */}
					<Box sx={rowSx}>
						<RangeInput
							label='CR'
							value={crRange}
							onChange={setCrRange}
							placeholderMin='Min CR'
							placeholderMax='Max CR'
							active={isRangeActive(crRange, bounds.minCr, bounds.maxCr)}
							accentColor={accentColor}
						/>
					</Box>
					{/* Row 2: Make - Country */}
					<Box sx={rowSx}>
						<Autocomplete
							limitTags={3} multiple value={carMake}
							sx={{ width: '100%', ...textFieldAccentSx, ...glowSx(carMake.length > 0) }}
							options={makeOptions} autoHighlight
							onChange={(_e, v) => {
								setCarMake(v);
								setPage(1);
							}}
							getOptionLabel={o => o}
							renderInput={params => (
								<TextField {...params} label='Make'
									inputProps={{ ...params.inputProps, autoComplete: 'new-password' }} />
							)}
						/>
						<Autocomplete
							limitTags={3} multiple value={carCountryValue}
							sx={{ width: '100%', ...textFieldAccentSx, ...glowSx(carCountryValue.length > 0) }}
							options={ALL_COUNTRIES} autoHighlight
							onChange={(_e, v) => {
								setCarCountryValue(v);
								setPage(1);
							}}
							getOptionLabel={o => o.label}
							isOptionEqualToValue={(option, value) => option.code === value.code}
							renderOption={(props, option) => (
								<Box component='li' sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
									<img loading='lazy' width='20'
										src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
										srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
										alt='' />
									{option.label} {option.code}
								</Box>
							)}
							renderInput={params => (
								<TextField {...params} label='Country'
									inputProps={{ ...params.inputProps, autoComplete: 'new-password' }} />
							)}
						/>
					</Box>
				</AccordionDetails>
			</Accordion>

			{/* =============================================
			    PANEL 2 - Collection / Creator / Status
			    ============================================= */}
			<Accordion
				TransitionProps={{ unmountOnExit: true }}
				sx={{ width: { xs: '100%', md: '98%' } }}
				expanded={expandedPanels.has('panel2')}
				onChange={togglePanel('panel2')}>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionHeaderSx}>
					<FilterBadge count={panel2Active}>
						<Typography>Collection / Creator / Status</Typography>
					</FilterBadge>
				</AccordionSummary>
				<AccordionDetails>
					<Box sx={rowSx}>
						{collectionOptions.length > 0 && (
							<Autocomplete
								multiple fullWidth limitTags={3}
								value={collection}
								options={collectionOptions}
								onChange={(_e, v) => {
									setCollection(v);
									setPage(1);
								}}
								sx={{ width: '100%', ...textFieldAccentSx, ...glowSx(collection.length > 0) }}
								renderInput={(params) => (
									<TextField {...params} label='Collection' placeholder='Filter by collection...'
										inputProps={{ ...params.inputProps, autoComplete: 'new-password' }} />
								)}
							/>
						)}
						{creatorOptions.length > 0 && (
							<Autocomplete
								multiple fullWidth limitTags={3}
								value={creator}
								options={creatorOptions}
								onChange={(_e, v) => {
									setCreator(v);
									setPage(1);
								}}
								sx={{ width: '100%', ...textFieldAccentSx, ...glowSx(creator.length > 0) }}
								renderInput={(params) => (
									<TextField {...params} label='Creator' placeholder='Filter by creator...'
										inputProps={{ ...params.inputProps, autoComplete: 'new-password' }} />
								)}
							/>
						)}
					</Box>
					<Box sx={rowSx}>
						<FormControl sx={{ width: '100%', ...glowSx(activeFilter !== 'all') }}>
							<InputLabel>Status</InputLabel>
							<Select
								value={activeFilter}
								label='Status'
								onChange={(e) => {
									setActiveFilter(e.target.value);
									setPage(1);
								}}>
								<MenuItem value='all'>All Cars</MenuItem>
								<MenuItem value='active'>Active Only</MenuItem>
								<MenuItem value='inactive'>Inactive Only</MenuItem>
							</Select>
						</FormControl>
					</Box>
				</AccordionDetails>
			</Accordion>

			{/* =============================================
			    BOTTOM BAR - Cars per page
			    ============================================= */}
			<Box
				sx={{
					mb: 1,
					width: { xs: '100%', md: '98%' },
					display: 'flex',
					alignItems: 'center',
					gap: 2,
				}}>
				<FormControl fullWidth>
					<InputLabel>Cars per page</InputLabel>
					<Select
						value={numOfCars}
						label='Cars per page'
						onChange={(e) => {
							setNumOfCars(e.target.value);
							setPage(1);
						}}>
						<MenuItem value={6}>6</MenuItem>
						<MenuItem value={12}>12</MenuItem>
						<MenuItem value={24}>24</MenuItem>
						<MenuItem value={48}>48</MenuItem>
					</Select>
				</FormControl>
			</Box>
		</Box>
	);
};

export default BMCarFilter;
