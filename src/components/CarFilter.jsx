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
	OutlinedInput,
	InputLabel,
	FormControl,
	Checkbox,
	ListItemText,
	Autocomplete,
	ListSubheader,
	Badge,
} from '@mui/material';

import carData from '../data/data.js';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';

// ============================================================
// STATIC DATA - computed once at module load
// ============================================================
const staticOptions = (() => {
	const makes = new Set();
	const bodyStyles = new Set();
	const creators = new Set();
	const tyres = new Set();
	const driveTypes = new Set();
	const fuelTypes = new Set();
	const gcs = new Set();
	const enginePositions = new Set();
	const countryCodes = new Set();
	const tags = new Set();

	carData.forEach(car => {
		if (Array.isArray(car.make)) car.make.forEach(m => makes.add(m));
		else if (car.make) makes.add(car.make);
		if (car.bodyStyle) bodyStyles.add(car.bodyStyle);
		if (car.creator) creators.add(car.creator);
		if (car.tyreType) tyres.add(car.tyreType);
		if (car.driveType) driveTypes.add(car.driveType);
		if (car.fuelType) fuelTypes.add(car.fuelType);
		if (car.gc) gcs.add(car.gc);
		if (car.enginePos) enginePositions.add(car.enginePos);
		if (car.country) countryCodes.add(car.country);
		if (Array.isArray(car.tags)) car.tags.forEach(t => tags.add(t));
	});

	return Object.freeze({
		makes: [...makes].sort(),
		bodyStyles: [...bodyStyles].sort(),
		creators: [...creators].sort(),
		tyres: [...tyres].sort(),
		driveTypes: [...driveTypes].sort(),
		fuelTypes: [...fuelTypes].sort(),
		gcs: [...gcs].sort(),
		enginePositions: [...enginePositions].sort(),
		tags: [...tags].sort(),
		countryCodes,
	});
})();

// ============================================================
// COUNTRIES - full list filtered to dataset
// ============================================================
const ALL_COUNTRIES = [
	{ code: 'AD', label: 'Andorra', phone: '376' },
	{ code: 'AE', label: 'United Arab Emirates', phone: '971' },
	{ code: 'AF', label: 'Afghanistan', phone: '93' },
	{ code: 'AG', label: 'Antigua and Barbuda', phone: '1-268' },
	{ code: 'AI', label: 'Anguilla', phone: '1-264' },
	{ code: 'AL', label: 'Albania', phone: '355' },
	{ code: 'AM', label: 'Armenia', phone: '374' },
	{ code: 'AO', label: 'Angola', phone: '244' },
	{ code: 'AQ', label: 'Antarctica', phone: '672' },
	{ code: 'AR', label: 'Argentina', phone: '54' },
	{ code: 'AS', label: 'American Samoa', phone: '1-684' },
	{ code: 'AT', label: 'Austria', phone: '43' },
	{ code: 'AU', label: 'Australia', phone: '61', suggested: true },
	{ code: 'AW', label: 'Aruba', phone: '297' },
	{ code: 'AX', label: 'Alland Islands', phone: '358' },
	{ code: 'AZ', label: 'Azerbaijan', phone: '994' },
	{ code: 'BA', label: 'Bosnia and Herzegovina', phone: '387' },
	{ code: 'BB', label: 'Barbados', phone: '1-246' },
	{ code: 'BD', label: 'Bangladesh', phone: '880' },
	{ code: 'BE', label: 'Belgium', phone: '32' },
	{ code: 'BF', label: 'Burkina Faso', phone: '226' },
	{ code: 'BG', label: 'Bulgaria', phone: '359' },
	{ code: 'BH', label: 'Bahrain', phone: '973' },
	{ code: 'BI', label: 'Burundi', phone: '257' },
	{ code: 'BJ', label: 'Benin', phone: '229' },
	{ code: 'BL', label: 'Saint Barthelemy', phone: '590' },
	{ code: 'BM', label: 'Bermuda', phone: '1-441' },
	{ code: 'BN', label: 'Brunei Darussalam', phone: '673' },
	{ code: 'BO', label: 'Bolivia', phone: '591' },
	{ code: 'BR', label: 'Brazil', phone: '55' },
	{ code: 'BS', label: 'Bahamas', phone: '1-242' },
	{ code: 'BT', label: 'Bhutan', phone: '975' },
	{ code: 'BV', label: 'Bouvet Island', phone: '47' },
	{ code: 'BW', label: 'Botswana', phone: '267' },
	{ code: 'BY', label: 'Belarus', phone: '375' },
	{ code: 'BZ', label: 'Belize', phone: '501' },
	{ code: 'CA', label: 'Canada', phone: '1', suggested: true },
	{ code: 'CC', label: 'Cocos (Keeling) Islands', phone: '61' },
	{ code: 'CD', label: 'Congo, Democratic Republic of the', phone: '243' },
	{ code: 'CF', label: 'Central African Republic', phone: '236' },
	{ code: 'CG', label: 'Congo, Republic of the', phone: '242' },
	{ code: 'CH', label: 'Switzerland', phone: '41' },
	{ code: 'CI', label: "Cote d'Ivoire", phone: '225' },
	{ code: 'CK', label: 'Cook Islands', phone: '682' },
	{ code: 'CL', label: 'Chile', phone: '56' },
	{ code: 'CM', label: 'Cameroon', phone: '237' },
	{ code: 'CN', label: 'China', phone: '86' },
	{ code: 'CO', label: 'Colombia', phone: '57' },
	{ code: 'CR', label: 'Costa Rica', phone: '506' },
	{ code: 'CU', label: 'Cuba', phone: '53' },
	{ code: 'CV', label: 'Cape Verde', phone: '238' },
	{ code: 'CW', label: 'Curacao', phone: '599' },
	{ code: 'CX', label: 'Christmas Island', phone: '61' },
	{ code: 'CY', label: 'Cyprus', phone: '357' },
	{ code: 'CZ', label: 'Czech Republic', phone: '420' },
	{ code: 'DE', label: 'Germany', phone: '49', suggested: true },
	{ code: 'DJ', label: 'Djibouti', phone: '253' },
	{ code: 'DK', label: 'Denmark', phone: '45' },
	{ code: 'DM', label: 'Dominica', phone: '1-767' },
	{ code: 'DO', label: 'Dominican Republic', phone: '1-809' },
	{ code: 'DZ', label: 'Algeria', phone: '213' },
	{ code: 'EC', label: 'Ecuador', phone: '593' },
	{ code: 'EE', label: 'Estonia', phone: '372' },
	{ code: 'EG', label: 'Egypt', phone: '20' },
	{ code: 'EH', label: 'Western Sahara', phone: '212' },
	{ code: 'ER', label: 'Eritrea', phone: '291' },
	{ code: 'ES', label: 'Spain', phone: '34' },
	{ code: 'ET', label: 'Ethiopia', phone: '251' },
	{ code: 'FI', label: 'Finland', phone: '358' },
	{ code: 'FJ', label: 'Fiji', phone: '679' },
	{ code: 'FK', label: 'Falkland Islands (Malvinas)', phone: '500' },
	{ code: 'FM', label: 'Micronesia, Federated States of', phone: '691' },
	{ code: 'FO', label: 'Faroe Islands', phone: '298' },
	{ code: 'FR', label: 'France', phone: '33', suggested: true },
	{ code: 'GA', label: 'Gabon', phone: '241' },
	{ code: 'GB', label: 'United Kingdom', phone: '44' },
	{ code: 'GD', label: 'Grenada', phone: '1-473' },
	{ code: 'GE', label: 'Georgia', phone: '995' },
	{ code: 'GF', label: 'French Guiana', phone: '594' },
	{ code: 'GG', label: 'Guernsey', phone: '44' },
	{ code: 'GH', label: 'Ghana', phone: '233' },
	{ code: 'GI', label: 'Gibraltar', phone: '350' },
	{ code: 'GL', label: 'Greenland', phone: '299' },
	{ code: 'GM', label: 'Gambia', phone: '220' },
	{ code: 'GN', label: 'Guinea', phone: '224' },
	{ code: 'GP', label: 'Guadeloupe', phone: '590' },
	{ code: 'GQ', label: 'Equatorial Guinea', phone: '240' },
	{ code: 'GR', label: 'Greece', phone: '30' },
	{ code: 'GS', label: 'South Georgia and the South Sandwich Islands', phone: '500' },
	{ code: 'GT', label: 'Guatemala', phone: '502' },
	{ code: 'GU', label: 'Guam', phone: '1-671' },
	{ code: 'GW', label: 'Guinea-Bissau', phone: '245' },
	{ code: 'GY', label: 'Guyana', phone: '592' },
	{ code: 'HK', label: 'Hong Kong', phone: '852' },
	{ code: 'HM', label: 'Heard Island and McDonald Islands', phone: '672' },
	{ code: 'HN', label: 'Honduras', phone: '504' },
	{ code: 'HR', label: 'Croatia', phone: '385' },
	{ code: 'HT', label: 'Haiti', phone: '509' },
	{ code: 'HU', label: 'Hungary', phone: '36' },
	{ code: 'ID', label: 'Indonesia', phone: '62' },
	{ code: 'IE', label: 'Ireland', phone: '353' },
	{ code: 'IL', label: 'Israel', phone: '972' },
	{ code: 'IM', label: 'Isle of Man', phone: '44' },
	{ code: 'IN', label: 'India', phone: '91' },
	{ code: 'IO', label: 'British Indian Ocean Territory', phone: '246' },
	{ code: 'IQ', label: 'Iraq', phone: '964' },
	{ code: 'IR', label: 'Iran, Islamic Republic of', phone: '98' },
	{ code: 'IS', label: 'Iceland', phone: '354' },
	{ code: 'IT', label: 'Italy', phone: '39' },
	{ code: 'JE', label: 'Jersey', phone: '44' },
	{ code: 'JM', label: 'Jamaica', phone: '1-876' },
	{ code: 'JO', label: 'Jordan', phone: '962' },
	{ code: 'JP', label: 'Japan', phone: '81', suggested: true },
	{ code: 'KE', label: 'Kenya', phone: '254' },
	{ code: 'KG', label: 'Kyrgyzstan', phone: '996' },
	{ code: 'KH', label: 'Cambodia', phone: '855' },
	{ code: 'KI', label: 'Kiribati', phone: '686' },
	{ code: 'KM', label: 'Comoros', phone: '269' },
	{ code: 'KN', label: 'Saint Kitts and Nevis', phone: '1-869' },
	{ code: 'KP', label: "Korea, Democratic People's Republic of", phone: '850' },
	{ code: 'KR', label: 'Korea, Republic of', phone: '82' },
	{ code: 'KW', label: 'Kuwait', phone: '965' },
	{ code: 'KY', label: 'Cayman Islands', phone: '1-345' },
	{ code: 'KZ', label: 'Kazakhstan', phone: '7' },
	{ code: 'LA', label: "Lao People's Democratic Republic", phone: '856' },
	{ code: 'LB', label: 'Lebanon', phone: '961' },
	{ code: 'LC', label: 'Saint Lucia', phone: '1-758' },
	{ code: 'LI', label: 'Liechtenstein', phone: '423' },
	{ code: 'LK', label: 'Sri Lanka', phone: '94' },
	{ code: 'LR', label: 'Liberia', phone: '231' },
	{ code: 'LS', label: 'Lesotho', phone: '266' },
	{ code: 'LT', label: 'Lithuania', phone: '370' },
	{ code: 'LU', label: 'Luxembourg', phone: '352' },
	{ code: 'LV', label: 'Latvia', phone: '371' },
	{ code: 'LY', label: 'Libya', phone: '218' },
	{ code: 'MA', label: 'Morocco', phone: '212' },
	{ code: 'MC', label: 'Monaco', phone: '377' },
	{ code: 'MD', label: 'Moldova, Republic of', phone: '373' },
	{ code: 'ME', label: 'Montenegro', phone: '382' },
	{ code: 'MF', label: 'Saint Martin (French part)', phone: '590' },
	{ code: 'MG', label: 'Madagascar', phone: '261' },
	{ code: 'MH', label: 'Marshall Islands', phone: '692' },
	{ code: 'MK', label: 'Macedonia, the Former Yugoslav Republic of', phone: '389' },
	{ code: 'ML', label: 'Mali', phone: '223' },
	{ code: 'MM', label: 'Myanmar', phone: '95' },
	{ code: 'MN', label: 'Mongolia', phone: '976' },
	{ code: 'MO', label: 'Macao', phone: '853' },
	{ code: 'MP', label: 'Northern Mariana Islands', phone: '1-670' },
	{ code: 'MQ', label: 'Martinique', phone: '596' },
	{ code: 'MR', label: 'Mauritania', phone: '222' },
	{ code: 'MS', label: 'Montserrat', phone: '1-664' },
	{ code: 'MT', label: 'Malta', phone: '356' },
	{ code: 'MU', label: 'Mauritius', phone: '230' },
	{ code: 'MV', label: 'Maldives', phone: '960' },
	{ code: 'MW', label: 'Malawi', phone: '265' },
	{ code: 'MX', label: 'Mexico', phone: '52' },
	{ code: 'MY', label: 'Malaysia', phone: '60' },
	{ code: 'MZ', label: 'Mozambique', phone: '258' },
	{ code: 'NA', label: 'Namibia', phone: '264' },
	{ code: 'NC', label: 'New Caledonia', phone: '687' },
	{ code: 'NE', label: 'Niger', phone: '227' },
	{ code: 'NF', label: 'Norfolk Island', phone: '672' },
	{ code: 'NG', label: 'Nigeria', phone: '234' },
	{ code: 'NI', label: 'Nicaragua', phone: '505' },
	{ code: 'NL', label: 'Netherlands', phone: '31' },
	{ code: 'NO', label: 'Norway', phone: '47' },
	{ code: 'NP', label: 'Nepal', phone: '977' },
	{ code: 'NR', label: 'Nauru', phone: '674' },
	{ code: 'NU', label: 'Niue', phone: '683' },
	{ code: 'NZ', label: 'New Zealand', phone: '64' },
	{ code: 'OM', label: 'Oman', phone: '968' },
	{ code: 'PA', label: 'Panama', phone: '507' },
	{ code: 'PE', label: 'Peru', phone: '51' },
	{ code: 'PF', label: 'French Polynesia', phone: '689' },
	{ code: 'PG', label: 'Papua New Guinea', phone: '675' },
	{ code: 'PH', label: 'Philippines', phone: '63' },
	{ code: 'PK', label: 'Pakistan', phone: '92' },
	{ code: 'PL', label: 'Poland', phone: '48' },
	{ code: 'PM', label: 'Saint Pierre and Miquelon', phone: '508' },
	{ code: 'PN', label: 'Pitcairn', phone: '870' },
	{ code: 'PR', label: 'Puerto Rico', phone: '1' },
	{ code: 'PS', label: 'Palestine, State of', phone: '970' },
	{ code: 'PT', label: 'Portugal', phone: '351' },
	{ code: 'PW', label: 'Palau', phone: '680' },
	{ code: 'PY', label: 'Paraguay', phone: '595' },
	{ code: 'QA', label: 'Qatar', phone: '974' },
	{ code: 'RE', label: 'Reunion', phone: '262' },
	{ code: 'RO', label: 'Romania', phone: '40' },
	{ code: 'RS', label: 'Serbia', phone: '381' },
	{ code: 'RU', label: 'Russian Federation', phone: '7' },
	{ code: 'RW', label: 'Rwanda', phone: '250' },
	{ code: 'SA', label: 'Saudi Arabia', phone: '966' },
	{ code: 'SB', label: 'Solomon Islands', phone: '677' },
	{ code: 'SC', label: 'Seychelles', phone: '248' },
	{ code: 'SD', label: 'Sudan', phone: '249' },
	{ code: 'SE', label: 'Sweden', phone: '46' },
	{ code: 'SG', label: 'Singapore', phone: '65' },
	{ code: 'SH', label: 'Saint Helena', phone: '290' },
	{ code: 'SI', label: 'Slovenia', phone: '386' },
	{ code: 'SJ', label: 'Svalbard and Jan Mayen', phone: '47' },
	{ code: 'SK', label: 'Slovakia', phone: '421' },
	{ code: 'SL', label: 'Sierra Leone', phone: '232' },
	{ code: 'SM', label: 'San Marino', phone: '378' },
	{ code: 'SN', label: 'Senegal', phone: '221' },
	{ code: 'SO', label: 'Somalia', phone: '252' },
	{ code: 'SR', label: 'Suriname', phone: '597' },
	{ code: 'SS', label: 'South Sudan', phone: '211' },
	{ code: 'ST', label: 'Sao Tome and Principe', phone: '239' },
	{ code: 'SV', label: 'El Salvador', phone: '503' },
	{ code: 'SX', label: 'Sint Maarten (Dutch part)', phone: '1-721' },
	{ code: 'SY', label: 'Syrian Arab Republic', phone: '963' },
	{ code: 'SZ', label: 'Swaziland', phone: '268' },
	{ code: 'TC', label: 'Turks and Caicos Islands', phone: '1-649' },
	{ code: 'TD', label: 'Chad', phone: '235' },
	{ code: 'TF', label: 'French Southern Territories', phone: '262' },
	{ code: 'TG', label: 'Togo', phone: '228' },
	{ code: 'TH', label: 'Thailand', phone: '66' },
	{ code: 'TJ', label: 'Tajikistan', phone: '992' },
	{ code: 'TK', label: 'Tokelau', phone: '690' },
	{ code: 'TL', label: 'Timor-Leste', phone: '670' },
	{ code: 'TM', label: 'Turkmenistan', phone: '993' },
	{ code: 'TN', label: 'Tunisia', phone: '216' },
	{ code: 'TO', label: 'Tonga', phone: '676' },
	{ code: 'TR', label: 'Turkey', phone: '90' },
	{ code: 'TT', label: 'Trinidad and Tobago', phone: '1-868' },
	{ code: 'TV', label: 'Tuvalu', phone: '688' },
	{ code: 'TW', label: 'Taiwan, Republic of China', phone: '886' },
	{ code: 'TZ', label: 'United Republic of Tanzania', phone: '255' },
	{ code: 'UA', label: 'Ukraine', phone: '380' },
	{ code: 'UG', label: 'Uganda', phone: '256' },
	{ code: 'US', label: 'United States', phone: '1', suggested: true },
	{ code: 'UY', label: 'Uruguay', phone: '598' },
	{ code: 'UZ', label: 'Uzbekistan', phone: '998' },
	{ code: 'VA', label: 'Holy See (Vatican City State)', phone: '379' },
	{ code: 'VC', label: 'Saint Vincent and the Grenadines', phone: '1-784' },
	{ code: 'VE', label: 'Venezuela', phone: '58' },
	{ code: 'VG', label: 'British Virgin Islands', phone: '1-284' },
	{ code: 'VI', label: 'US Virgin Islands', phone: '1-340' },
	{ code: 'VN', label: 'Vietnam', phone: '84' },
	{ code: 'VU', label: 'Vanuatu', phone: '678' },
	{ code: 'WF', label: 'Wallis and Futuna', phone: '681' },
	{ code: 'WS', label: 'Samoa', phone: '685' },
	{ code: 'XK', label: 'Kosovo', phone: '383' },
	{ code: 'YE', label: 'Yemen', phone: '967' },
	{ code: 'YT', label: 'Mayotte', phone: '262' },
	{ code: 'ZA', label: 'South Africa', phone: '27' },
	{ code: 'ZM', label: 'Zambia', phone: '260' },
	{ code: 'ZW', label: 'Zimbabwe', phone: '263' },
];

const countries = ALL_COUNTRIES.filter(c => staticOptions.countryCodes.has(c.code));

// ============================================================
// MENU PROPS for Select dropdowns
// ============================================================
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
};

// ============================================================
// REUSABLE RANGE INPUT - two number fields with a label
// Replaces all sliders (much better on mobile)
// Glows in accent color when value differs from default
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
const CarFilter = ({
	accentColor = '#b8860b',
	bounds,
	search, setSearch,
	carsSortType, setCarsSortType,
	rqValue, setRqValue,
	topSpeed, setTopSpeed,
	zeroTo60, setZeroTo60,
	handling, setHandling,
	year, setYear,
	mra, setMra,
	ola, setOla,
	weight, setWeight,
	seatCount, setSeatCount,
	carTag, setCarTag,
	carCountryValue, setCarCountryValue,
	carMake, setCarMake,
	carTyre, setCarTyre,
	carDriveType, setCarDriveType,
	bodyStyle, setBodyStyle,
	creator, setCreator,
	fuelType, setFuelType,
	gc, setGc,
	enginePos, setEnginePos,
	numOfCars, setNumOfCars,
	prize, setPrize,
	setPage,
}) => {
	// Multiple panels can be open at once
	const [expandedPanels, setExpandedPanels] = useState(new Set());

	const togglePanel = (panel) => (_event, isExpanded) => {
		setExpandedPanels(prev => {
			const next = new Set(prev);
			if (isExpanded) next.add(panel);
			else next.delete(panel);
			return next;
		});
	};

	// Shared sx
	const textFieldAccentSx = {
		'& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: accentColor },
		'& .MuiInputLabel-root.Mui-focused': { color: accentColor },
	};

	// Glow effect for active filters - applied to Autocomplete and FormControl wrappers
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

	// --- Active filter counts ---
	const panel1Active = useMemo(() => {
		let n = 0;
		if (isRangeActive(rqValue, bounds.minCr, bounds.maxCr)) n++;
		if (carTag.length > 0) n++;
		if (carMake.length > 0) n++;
		if (carTyre.length > 0) n++;
		if (carCountryValue.length > 0) n++;
		if (isRangeActive(year, bounds.minYear, bounds.maxYear)) n++;
		if (carDriveType.length > 0) n++;
		if (gc.length > 0) n++;
		return n;
	}, [rqValue, carTag, carMake, carTyre, carCountryValue, year, carDriveType, gc, bounds]);

	const panel2Active = useMemo(() => {
		let n = 0;
		if (isRangeActive(topSpeed, bounds.minTopSpeed, bounds.maxTopSpeed)) n++;
		if (isRangeActive(zeroTo60, bounds.min0to60, bounds.max0to60)) n++;
		if (isRangeActive(handling, bounds.minHandling, bounds.maxHandling)) n++;
		if (isRangeActive(weight, bounds.minWeight, bounds.maxWeight)) n++;
		if (isRangeActive(mra, bounds.minMra, bounds.maxMra)) n++;
		if (isRangeActive(ola, bounds.minOla, bounds.maxOla)) n++;
		return n;
	}, [topSpeed, zeroTo60, handling, weight, mra, ola, bounds]);

	const panel3Active = useMemo(() => {
		let n = 0;
		if (bodyStyle.length > 0) n++;
		if (fuelType.length > 0) n++;
		if (isRangeActive(seatCount, bounds.minSeatCount, bounds.maxSeatCount)) n++;
		if (enginePos.length > 0) n++;
		return n;
	}, [bodyStyle, fuelType, seatCount, enginePos, bounds]);

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

	const makeMultiSelectHandler = (setter) => (event) => {
		const { target: { value } } = event;
		setter(typeof value === 'string' ? value.split(',') : value);
	};

	// Shared layout helpers
	const rowSx = {
		mb: 1.5,
		width: { xs: '100%', md: '98%' },
		display: 'flex',
		flexDirection: { xs: 'column', md: 'row' },
		gap: 2,
	};

	const accordionHeaderSx = {
		'&.Mui-expanded': { borderBottom: `2px solid ${accentColor}` },
	};

	// ============================================================
	// RENDER
	// ============================================================
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
					label='Search cars'
					variant='outlined'
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					InputProps={{
						startAdornment: (
							<SearchIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1 }} />
						),
					}}
					sx={{ ...textFieldAccentSx, ...glowSx(search.length > 0) }}
				/>
				<FormControl sx={{ minWidth: { xs: '100%', md: 260 } }}>
					<InputLabel htmlFor='sort-select'>Sort</InputLabel>
					<Select
						value={carsSortType}
						onChange={e => setCarsSortType(e.target.value)}
						label='Sort'
						inputProps={{ id: 'sort-select' }}>
						<ListSubheader sx={{ bgcolor: 'background.paper2' }}>CR Sort</ListSubheader>
						<MenuItem value={1}>CR: Ascending {'<'}</MenuItem>
						<MenuItem value={2}>CR: Descending {'>'}</MenuItem>
						<ListSubheader sx={{ bgcolor: 'background.paper2' }}>Top Speed Sort</ListSubheader>
						<MenuItem value={3}>TP: Ascending {'<'}</MenuItem>
						<MenuItem value={4}>TP: Descending {'>'}</MenuItem>
						<ListSubheader sx={{ bgcolor: 'background.paper2' }}>0-60 Sort</ListSubheader>
						<MenuItem value={5}>0-60: Ascending {'<'}</MenuItem>
						<MenuItem value={6}>0-60: Descending {'>'}</MenuItem>
						<ListSubheader sx={{ bgcolor: 'background.paper2' }}>Handling Sort</ListSubheader>
						<MenuItem value={7}>Handling: Ascending {'<'}</MenuItem>
						<MenuItem value={8}>Handling: Descending {'>'}</MenuItem>
						<ListSubheader sx={{ bgcolor: 'background.paper2' }}>Year Sort</ListSubheader>
						<MenuItem value={9}>Year: Ascending {'<'}</MenuItem>
						<MenuItem value={10}>Year: Descending {'>'}</MenuItem>
						<ListSubheader sx={{ bgcolor: 'background.paper2' }}>MRA Sort</ListSubheader>
						<MenuItem value={11}>MRA: Ascending {'<'}</MenuItem>
						<MenuItem value={12}>MRA: Descending {'>'}</MenuItem>
						<ListSubheader sx={{ bgcolor: 'background.paper2' }}>OLA Sort</ListSubheader>
						<MenuItem value={13}>OLA: Ascending {'<'}</MenuItem>
						<MenuItem value={14}>OLA: Descending {'>'}</MenuItem>
						<ListSubheader sx={{ bgcolor: 'background.paper2' }}>Weight Sort</ListSubheader>
						<MenuItem value={15}>Weight: Ascending {'<'}</MenuItem>
						<MenuItem value={16}>Weight: Descending {'>'}</MenuItem>
					</Select>
				</FormControl>
			</Box>

			{/* =============================================
			    BOX 1 - "Looking for a specific group"
			    CR + Tags | Make + Tyre | Country + Year |
			    Drive Type + Ground Clearance
			    ============================================= */}
			<Accordion
				TransitionProps={{ unmountOnExit: true }}
				sx={{ width: { xs: '100%', md: '98%' } }}
				expanded={expandedPanels.has('panel1')}
				onChange={togglePanel('panel1')}>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionHeaderSx}>
					<FilterBadge count={panel1Active}>
						<Typography>CR / Tags / Make / Tyre / Country / Year / Drive / GC</Typography>
					</FilterBadge>
				</AccordionSummary>
				<AccordionDetails>
					{/* Row 1: CR - Tags */}
					<Box sx={rowSx}>
						<RangeInput label='CR' value={rqValue} onChange={setRqValue} placeholderMin='Min CR' placeholderMax='Max CR'
							active={isRangeActive(rqValue, bounds.minCr, bounds.maxCr)} accentColor={accentColor} />
						<Autocomplete
							limitTags={3} multiple value={carTag}
							sx={{ width: '100%', ...textFieldAccentSx, ...glowSx(carTag.length > 0) }}
							options={staticOptions.tags} autoHighlight
							onChange={(_e, v) => setCarTag(v)}
							getOptionLabel={o => o}
							renderInput={params => (
								<TextField {...params} label='Tags' inputProps={{ ...params.inputProps, autoComplete: 'new-password' }} />
							)}
						/>
					</Box>

					{/* Row 2: Make - Tyre Type */}
					<Box sx={rowSx}>
						<Autocomplete
							limitTags={3} multiple value={carMake}
							sx={{ width: '100%', ...textFieldAccentSx, ...glowSx(carMake.length > 0) }}
							options={staticOptions.makes} autoHighlight
							onChange={(_e, v) => setCarMake(v)}
							getOptionLabel={o => o}
							renderInput={params => (
								<TextField {...params} label='Make' inputProps={{ ...params.inputProps, autoComplete: 'new-password' }} />
							)}
						/>
						<FormControl sx={{ width: '100%', ...glowSx(carTyre.length > 0) }}>
							<InputLabel>Tyre Type</InputLabel>
							<Select multiple value={carTyre} onChange={makeMultiSelectHandler(setCarTyre)}
								input={<OutlinedInput label='Tyre Type' />}
								renderValue={selected => selected.join(', ')} MenuProps={MenuProps}>
								{staticOptions.tyres.map(name => (
									<MenuItem key={name} value={name}>
										<Checkbox color='success' checked={carTyre.indexOf(name) > -1} />
										<ListItemText primary={name} />
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>

					{/* Row 3: Country - Year */}
					<Box sx={rowSx}>
						<Autocomplete
							limitTags={4} multiple value={carCountryValue}
							sx={{ width: '100%', ...textFieldAccentSx, ...glowSx(carCountryValue.length > 0) }}
							options={countries} autoHighlight
							onChange={(_e, v) => setCarCountryValue(v)}
							getOptionLabel={o => o.label}
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
								<TextField {...params} label='Country' inputProps={{ ...params.inputProps, autoComplete: 'new-password' }} />
							)}
						/>
						<RangeInput label='Year' value={year} onChange={setYear} placeholderMin='Min Year' placeholderMax='Max Year'
							active={isRangeActive(year, bounds.minYear, bounds.maxYear)} accentColor={accentColor} />
					</Box>

					{/* Row 4: Drive Type - Ground Clearance */}
					<Box sx={rowSx}>
						<FormControl sx={{ width: '100%', ...glowSx(carDriveType.length > 0) }}>
							<InputLabel>Drive Type</InputLabel>
							<Select multiple value={carDriveType} onChange={makeMultiSelectHandler(setCarDriveType)}
								input={<OutlinedInput label='Drive Type' />}
								renderValue={selected => selected.join(', ')} MenuProps={MenuProps}>
								{staticOptions.driveTypes.map(name => (
									<MenuItem key={name} value={name}>
										<Checkbox color='success' checked={carDriveType.indexOf(name) > -1} />
										<ListItemText primary={name} />
									</MenuItem>
								))}
							</Select>
						</FormControl>
						<FormControl sx={{ width: '100%', ...glowSx(gc.length > 0) }}>
							<InputLabel>Ground Clearance</InputLabel>
							<Select multiple value={gc} onChange={makeMultiSelectHandler(setGc)}
								input={<OutlinedInput label='Ground Clearance' />}
								renderValue={selected => selected.join(', ')} MenuProps={MenuProps}>
								{staticOptions.gcs.map((name, i) => (
									<MenuItem key={i} value={name}>
										<Checkbox color='success' checked={gc.indexOf(name) > -1} />
										<ListItemText primary={name} />
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				</AccordionDetails>
			</Accordion>

			{/* =============================================
			    BOX 2 - "Looking by stats"
			    Top Speed + 0-60 | Handling + Weight |
			    MRA + OLA
			    ============================================= */}
			<Accordion
				TransitionProps={{ unmountOnExit: true }}
				sx={{ width: { xs: '100%', md: '98%' } }}
				expanded={expandedPanels.has('panel2')}
				onChange={togglePanel('panel2')}>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionHeaderSx}>
					<FilterBadge count={panel2Active}>
						<Typography>Top Speed / 0-60 / Handling / Weight / MRA / OLA</Typography>
					</FilterBadge>
				</AccordionSummary>
				<AccordionDetails>
					{/* Row 1: Top Speed - 0-60 */}
					<Box sx={rowSx}>
						<RangeInput label='Top Spd' value={topSpeed} onChange={setTopSpeed} placeholderMin='Min MPH' placeholderMax='Max MPH'
							active={isRangeActive(topSpeed, bounds.minTopSpeed, bounds.maxTopSpeed)} accentColor={accentColor} />
						<RangeInput label='0-60' value={zeroTo60} onChange={setZeroTo60} placeholderMin='Min sec' placeholderMax='Max sec'
							active={isRangeActive(zeroTo60, bounds.min0to60, bounds.max0to60)} accentColor={accentColor} />
					</Box>
					{/* Row 2: Handling - Weight */}
					<Box sx={rowSx}>
						<RangeInput label='Handling' value={handling} onChange={setHandling} placeholderMin='Min' placeholderMax='Max'
							active={isRangeActive(handling, bounds.minHandling, bounds.maxHandling)} accentColor={accentColor} />
						<RangeInput label='Weight' value={weight} onChange={setWeight} placeholderMin='Min KG' placeholderMax='Max KG'
							active={isRangeActive(weight, bounds.minWeight, bounds.maxWeight)} accentColor={accentColor} />
					</Box>
					{/* Row 3: MRA - OLA */}
					<Box sx={rowSx}>
						<RangeInput label='MRA' value={mra} onChange={setMra} placeholderMin='Min MRA' placeholderMax='Max MRA'
							active={isRangeActive(mra, bounds.minMra, bounds.maxMra)} accentColor={accentColor} />
						<RangeInput label='OLA' value={ola} onChange={setOla} placeholderMin='Min OLA' placeholderMax='Max OLA'
							active={isRangeActive(ola, bounds.minOla, bounds.maxOla)} accentColor={accentColor} />
					</Box>
				</AccordionDetails>
			</Accordion>

			{/* =============================================
			    BOX 3 - "Looking by other properties"
			    Body Style + Fuel Type | Seats + Engine Pos
			    ============================================= */}
			<Accordion
				TransitionProps={{ unmountOnExit: true }}
				sx={{ mb: 1, width: { xs: '100%', md: '98%' } }}
				expanded={expandedPanels.has('panel3')}
				onChange={togglePanel('panel3')}>
				<AccordionSummary expandIcon={<ExpandMoreIcon />} sx={accordionHeaderSx}>
					<FilterBadge count={panel3Active}>
						<Typography>Body Style / Fuel Type / Seats / Engine Position</Typography>
					</FilterBadge>
				</AccordionSummary>
				<AccordionDetails>
					{/* Row 1: Body Style - Fuel Type */}
					<Box sx={rowSx}>
						<Autocomplete
							limitTags={3} multiple value={bodyStyle}
							sx={{ width: '100%', ...textFieldAccentSx, ...glowSx(bodyStyle.length > 0) }}
							options={staticOptions.bodyStyles} autoHighlight
							onChange={(_e, v) => setBodyStyle(v)}
							getOptionLabel={o => o}
							renderInput={params => (
								<TextField {...params} label='Body Style' inputProps={{ ...params.inputProps, autoComplete: 'new-password' }} />
							)}
						/>
						<Autocomplete
							limitTags={3} multiple value={fuelType}
							sx={{ width: '100%', ...textFieldAccentSx, ...glowSx(fuelType.length > 0) }}
							options={staticOptions.fuelTypes} autoHighlight
							onChange={(_e, v) => setFuelType(v)}
							getOptionLabel={o => o}
							renderInput={params => (
								<TextField {...params} label='Fuel Type' inputProps={{ ...params.inputProps, autoComplete: 'new-password' }} />
							)}
						/>
					</Box>
					{/* Row 2: Seats - Engine Position */}
					<Box sx={rowSx}>
						<RangeInput label='Seats' value={seatCount} onChange={setSeatCount} placeholderMin='Min' placeholderMax='Max'
							active={isRangeActive(seatCount, bounds.minSeatCount, bounds.maxSeatCount)} accentColor={accentColor} />
						<FormControl sx={{ width: '100%', ...glowSx(enginePos.length > 0) }}>
							<InputLabel>Engine Position</InputLabel>
							<Select multiple value={enginePos} onChange={makeMultiSelectHandler(setEnginePos)}
								input={<OutlinedInput label='Engine Position' />}
								renderValue={selected => selected.join(', ')} MenuProps={MenuProps}>
								{staticOptions.enginePositions.map((name, i) => (
									<MenuItem key={i} value={name}>
										<Checkbox color='success' checked={enginePos.indexOf(name) > -1} />
										<ListItemText primary={name} />
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				</AccordionDetails>
			</Accordion>

			{/* =============================================
			    BOTTOM BAR - Cars per page, Creator, Prize
			    ============================================= */}
			<Box
				sx={{
					mb: 1,
					width: { xs: '100%', md: '98%' },
					display: 'flex',
					alignItems: 'center',
					flexDirection: { xs: 'column', md: 'row' },
					gap: 2,
				}}>
				<FormControl fullWidth>
					<InputLabel>Cars per page</InputLabel>
					<Select value={numOfCars / 5} label='Cars per page'
						onChange={e => setNumOfCars(e.target.value * 5)} defaultValue={2}>
						<MenuItem value={1}>5</MenuItem>
						<MenuItem value={2}>10</MenuItem>
						<MenuItem value={3}>15</MenuItem>
						<MenuItem value={4}>20</MenuItem>
						<MenuItem value={8}>40</MenuItem>
					</Select>
				</FormControl>

				<Autocomplete
					limitTags={2} multiple value={creator}
					sx={{ width: '100%', ...textFieldAccentSx, ...glowSx(creator.length > 0) }}
					options={staticOptions.creators} autoHighlight
					onChange={(_e, v) => setCreator(v)}
					getOptionLabel={o => o}
					renderInput={params => (
						<TextField {...params} label='Creators' inputProps={{ ...params.inputProps, autoComplete: 'new-password' }} />
					)}
				/>

				<FormControl fullWidth sx={{ ...glowSx(prize !== 1) }}>
					<InputLabel>Prize cars</InputLabel>
					<Select value={prize} label='Prize cars'
						onChange={e => setPrize(e.target.value)} defaultValue={1}>
						<MenuItem value={1}>All</MenuItem>
						<MenuItem value={2}>Prize</MenuItem>
						<MenuItem value={3}>Non-Prize</MenuItem>
					</Select>
				</FormControl>
			</Box>
		</Box>
	);
};

export default CarFilter;
