import react, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
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
	Slider,
	OutlinedInput,
	InputLabel,
	FormControl,
	Checkbox,
	ListItemText,
	Autocomplete,
	ListSubheader,
} from '@mui/material';

import carData from '../data/data.js';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { ContactPageSharp } from '@mui/icons-material';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

function rqSliderValuetext(value) {
	return `${value} CR`;
}

function tpSliderValuetext(value) {
	return `${value} MPH`;
}

function zero60SliderValuetext(value) {
	return `0-60 MPH: ${value}s`;
}

function handlingSliderValuetext(value) {
	return `${value} Handling`;
}

function yearSliderValuetext(value) {
	return `${value}`;
}

function mraSliderValuetext(value) {
	return `${value} MRA`;
}

function olaSliderValuetext(value) {
	return `${value} OLA`;
}

function weightSliderValuetext(value) {
	return `${value} KG`;
}

const minDistance = 0;

const maxRQ = 125;

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

const carTags = [];
function getCarTags() {
	carData.forEach(car => {
		if (Array.isArray(car.tags) && car.tags.length > 0) {
			car.tags.forEach(tag => {
				if (!carTags.includes(tag)) {
					carTags.push(tag);
				}
			});
		}
	});
}
getCarTags();

function getStyles(name, carTag, theme) {
	return {
		fontWeight:
			carTag.indexOf(name) === -1
				? theme.typography.fontWeightRegular
				: theme.typography.fontWeightMedium,
	};
}

const CarFilter = ({
	weight,
	setWeight,
	lowestWeight,
	highestWeight,
	gc,
	setGc,
	fuelType,
	setFuelType,
	setPrize,
	prize,
	setNumOfCars,
	numOfCars,
	creator,
	setCreator,
	bodyStyle,
	setBodyStyle,
	ola,
	setOla,
	highestOla,
	lowestOla,
	mra,
	setMra,
	highestMra,
	lowestMra,
	year,
	setYear,
	highestYear,
	lowestYear,
	highestHandling,
	lowestHandling,
	handling,
	setHandling,
	zeroTo60,
	setZeroTo60,
	highest0To60,
	lowest0To60,
	highestRqValue,
	lowestRqValue,
	highestCarSpeed,
	lowestCarSpeed,
	topSpeed,
	setTopSpeed,
	carDriveType,
	setCarDriveType,
	carTyre,
	setCarTyre,
	carMake,
	setCarMake,
	carCountryValue,
	setCarCountryValue,
	setSearch,
	search,
	setRqValue,
	rqValue,
	setPage,
	setCarsSortType,
	carsSortType,
	carTag,
	setCarTag,
}) => {
	const [expanded, setExpanded] = useState(false);

	const theme = useTheme();

	const carCountries = [];
	const carMakes = [];
	const bodyStyles = [];
	const creators = [];
	const carTyres = [];
	const carDriveTypes = [];
	const carFuelTypes = [];
	const carGcs = [];

	const getCarOptions = () => {
		carData.forEach(car => {
			// getting all car countries
			if (!carCountries.includes(car.country)) {
				carCountries.push(car.country);
				carCountries.sort((a, b) => a.label - b.label);
			}

			// getting all car makes
			if (Array.isArray(car.make)) {
				car.make.forEach(make => {
					if (!carMakes.includes(make)) {
						carMakes.push(make);
					}
				});
			} else if (!carMakes.includes(car.make)) {
				carMakes.push(car.make);
			}

			// getting all car body styles
			if (!bodyStyles.includes(car.bodyStyle)) {
				bodyStyles.push(car.bodyStyle);
				bodyStyles.sort();
			}

			// getting all car creators
			if (!creators.includes(car.creator)) {
				creators.push(car.creator);
				creators.sort();
			}

			// getting all car tyre types
			if (
				!carTyres.includes(car.tyreType) &&
				car.tyreType !== undefined
			) {
				carTyres.push(car.tyreType);
			}

			// getting all car drive types
			if (
				!carDriveTypes.includes(car.driveType) &&
				car.driveType !== undefined
			) {
				carDriveTypes.push(car.driveType);
			}

			// getting all car fuel types
			if (
				!carFuelTypes.includes(car.fuelType) &&
				car.fuelType !== undefined
			) {
				carFuelTypes.push(car.fuelType);
				carFuelTypes.sort();
			}

			// getting all car gcs
			if (
				!carGcs.includes(car.gc) &&
				car.gc !== undefined
			) {
				carGcs.push(car.gc);
				carFuelTypes.sort();
			}
		});
	};

	getCarOptions();
	// useEffect(() => {
	//   // getCarMakes()
	//   console.log(carTyres)
	// }, [])

	const countries = [
		{ code: 'AD', label: 'Andorra', phone: '376' },
		{
			code: 'AE',
			label: 'United Arab Emirates',
			phone: '971',
		},
		{ code: 'AF', label: 'Afghanistan', phone: '93' },
		{
			code: 'AG',
			label: 'Antigua and Barbuda',
			phone: '1-268',
		},
		{ code: 'AI', label: 'Anguilla', phone: '1-264' },
		{ code: 'AL', label: 'Albania', phone: '355' },
		{ code: 'AM', label: 'Armenia', phone: '374' },
		{ code: 'AO', label: 'Angola', phone: '244' },
		{ code: 'AQ', label: 'Antarctica', phone: '672' },
		{ code: 'AR', label: 'Argentina', phone: '54' },
		{ code: 'AS', label: 'American Samoa', phone: '1-684' },
		{ code: 'AT', label: 'Austria', phone: '43' },
		{
			code: 'AU',
			label: 'Australia',
			phone: '61',
			suggested: true,
		},
		{ code: 'AW', label: 'Aruba', phone: '297' },
		{ code: 'AX', label: 'Alland Islands', phone: '358' },
		{ code: 'AZ', label: 'Azerbaijan', phone: '994' },
		{
			code: 'BA',
			label: 'Bosnia and Herzegovina',
			phone: '387',
		},
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
		{
			code: 'BN',
			label: 'Brunei Darussalam',
			phone: '673',
		},
		{ code: 'BO', label: 'Bolivia', phone: '591' },
		{ code: 'BR', label: 'Brazil', phone: '55' },
		{ code: 'BS', label: 'Bahamas', phone: '1-242' },
		{ code: 'BT', label: 'Bhutan', phone: '975' },
		{ code: 'BV', label: 'Bouvet Island', phone: '47' },
		{ code: 'BW', label: 'Botswana', phone: '267' },
		{ code: 'BY', label: 'Belarus', phone: '375' },
		{ code: 'BZ', label: 'Belize', phone: '501' },
		{
			code: 'CA',
			label: 'Canada',
			phone: '1',
			suggested: true,
		},
		{
			code: 'CC',
			label: 'Cocos (Keeling) Islands',
			phone: '61',
		},
		{
			code: 'CD',
			label: 'Congo, Democratic Republic of the',
			phone: '243',
		},
		{
			code: 'CF',
			label: 'Central African Republic',
			phone: '236',
		},
		{
			code: 'CG',
			label: 'Congo, Republic of the',
			phone: '242',
		},
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
		{
			code: 'DE',
			label: 'Germany',
			phone: '49',
			suggested: true,
		},
		{ code: 'DJ', label: 'Djibouti', phone: '253' },
		{ code: 'DK', label: 'Denmark', phone: '45' },
		{ code: 'DM', label: 'Dominica', phone: '1-767' },
		{
			code: 'DO',
			label: 'Dominican Republic',
			phone: '1-809',
		},
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
		{
			code: 'FK',
			label: 'Falkland Islands (Malvinas)',
			phone: '500',
		},
		{
			code: 'FM',
			label: 'Micronesia, Federated States of',
			phone: '691',
		},
		{ code: 'FO', label: 'Faroe Islands', phone: '298' },
		{
			code: 'FR',
			label: 'France',
			phone: '33',
			suggested: true,
		},
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
		{
			code: 'GQ',
			label: 'Equatorial Guinea',
			phone: '240',
		},
		{ code: 'GR', label: 'Greece', phone: '30' },
		{
			code: 'GS',
			label: 'South Georgia and the South Sandwich Islands',
			phone: '500',
		},
		{ code: 'GT', label: 'Guatemala', phone: '502' },
		{ code: 'GU', label: 'Guam', phone: '1-671' },
		{ code: 'GW', label: 'Guinea-Bissau', phone: '245' },
		{ code: 'GY', label: 'Guyana', phone: '592' },
		{ code: 'HK', label: 'Hong Kong', phone: '852' },
		{
			code: 'HM',
			label: 'Heard Island and McDonald Islands',
			phone: '672',
		},
		{ code: 'HN', label: 'Honduras', phone: '504' },
		{ code: 'HR', label: 'Croatia', phone: '385' },
		{ code: 'HT', label: 'Haiti', phone: '509' },
		{ code: 'HU', label: 'Hungary', phone: '36' },
		{ code: 'ID', label: 'Indonesia', phone: '62' },
		{ code: 'IE', label: 'Ireland', phone: '353' },
		{ code: 'IL', label: 'Israel', phone: '972' },
		{ code: 'IM', label: 'Isle of Man', phone: '44' },
		{ code: 'IN', label: 'India', phone: '91' },
		{
			code: 'IO',
			label: 'British Indian Ocean Territory',
			phone: '246',
		},
		{ code: 'IQ', label: 'Iraq', phone: '964' },
		{
			code: 'IR',
			label: 'Iran, Islamic Republic of',
			phone: '98',
		},
		{ code: 'IS', label: 'Iceland', phone: '354' },
		{ code: 'IT', label: 'Italy', phone: '39' },
		{ code: 'JE', label: 'Jersey', phone: '44' },
		{ code: 'JM', label: 'Jamaica', phone: '1-876' },
		{ code: 'JO', label: 'Jordan', phone: '962' },
		{
			code: 'JP',
			label: 'Japan',
			phone: '81',
			suggested: true,
		},
		{ code: 'KE', label: 'Kenya', phone: '254' },
		{ code: 'KG', label: 'Kyrgyzstan', phone: '996' },
		{ code: 'KH', label: 'Cambodia', phone: '855' },
		{ code: 'KI', label: 'Kiribati', phone: '686' },
		{ code: 'KM', label: 'Comoros', phone: '269' },
		{
			code: 'KN',
			label: 'Saint Kitts and Nevis',
			phone: '1-869',
		},
		{
			code: 'KP',
			label: "Korea, Democratic People's Republic of",
			phone: '850',
		},
		{
			code: 'KR',
			label: 'Korea, Republic of',
			phone: '82',
		},
		{ code: 'KW', label: 'Kuwait', phone: '965' },
		{ code: 'KY', label: 'Cayman Islands', phone: '1-345' },
		{ code: 'KZ', label: 'Kazakhstan', phone: '7' },
		{
			code: 'LA',
			label: "Lao People's Democratic Republic",
			phone: '856',
		},
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
		{
			code: 'MD',
			label: 'Moldova, Republic of',
			phone: '373',
		},
		{ code: 'ME', label: 'Montenegro', phone: '382' },
		{
			code: 'MF',
			label: 'Saint Martin (French part)',
			phone: '590',
		},
		{ code: 'MG', label: 'Madagascar', phone: '261' },
		{ code: 'MH', label: 'Marshall Islands', phone: '692' },
		{
			code: 'MK',
			label: 'Macedonia, the Former Yugoslav Republic of',
			phone: '389',
		},
		{ code: 'ML', label: 'Mali', phone: '223' },
		{ code: 'MM', label: 'Myanmar', phone: '95' },
		{ code: 'MN', label: 'Mongolia', phone: '976' },
		{ code: 'MO', label: 'Macao', phone: '853' },
		{
			code: 'MP',
			label: 'Northern Mariana Islands',
			phone: '1-670',
		},
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
		{
			code: 'PM',
			label: 'Saint Pierre and Miquelon',
			phone: '508',
		},
		{ code: 'PN', label: 'Pitcairn', phone: '870' },
		{ code: 'PR', label: 'Puerto Rico', phone: '1' },
		{
			code: 'PS',
			label: 'Palestine, State of',
			phone: '970',
		},
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
		{
			code: 'SJ',
			label: 'Svalbard and Jan Mayen',
			phone: '47',
		},
		{ code: 'SK', label: 'Slovakia', phone: '421' },
		{ code: 'SL', label: 'Sierra Leone', phone: '232' },
		{ code: 'SM', label: 'San Marino', phone: '378' },
		{ code: 'SN', label: 'Senegal', phone: '221' },
		{ code: 'SO', label: 'Somalia', phone: '252' },
		{ code: 'SR', label: 'Suriname', phone: '597' },
		{ code: 'SS', label: 'South Sudan', phone: '211' },
		{
			code: 'ST',
			label: 'Sao Tome and Principe',
			phone: '239',
		},
		{ code: 'SV', label: 'El Salvador', phone: '503' },
		{
			code: 'SX',
			label: 'Sint Maarten (Dutch part)',
			phone: '1-721',
		},
		{
			code: 'SY',
			label: 'Syrian Arab Republic',
			phone: '963',
		},
		{ code: 'SZ', label: 'Swaziland', phone: '268' },
		{
			code: 'TC',
			label: 'Turks and Caicos Islands',
			phone: '1-649',
		},
		{ code: 'TD', label: 'Chad', phone: '235' },
		{
			code: 'TF',
			label: 'French Southern Territories',
			phone: '262',
		},
		{ code: 'TG', label: 'Togo', phone: '228' },
		{ code: 'TH', label: 'Thailand', phone: '66' },
		{ code: 'TJ', label: 'Tajikistan', phone: '992' },
		{ code: 'TK', label: 'Tokelau', phone: '690' },
		{ code: 'TL', label: 'Timor-Leste', phone: '670' },
		{ code: 'TM', label: 'Turkmenistan', phone: '993' },
		{ code: 'TN', label: 'Tunisia', phone: '216' },
		{ code: 'TO', label: 'Tonga', phone: '676' },
		{ code: 'TR', label: 'Turkey', phone: '90' },
		{
			code: 'TT',
			label: 'Trinidad and Tobago',
			phone: '1-868',
		},
		{ code: 'TV', label: 'Tuvalu', phone: '688' },
		{
			code: 'TW',
			label: 'Taiwan, Republic of China',
			phone: '886',
		},
		{
			code: 'TZ',
			label: 'United Republic of Tanzania',
			phone: '255',
		},
		{ code: 'UA', label: 'Ukraine', phone: '380' },
		{ code: 'UG', label: 'Uganda', phone: '256' },
		{
			code: 'US',
			label: 'United States',
			phone: '1',
			suggested: true,
		},
		{ code: 'UY', label: 'Uruguay', phone: '598' },
		{ code: 'UZ', label: 'Uzbekistan', phone: '998' },
		{
			code: 'VA',
			label: 'Holy See (Vatican City State)',
			phone: '379',
		},
		{
			code: 'VC',
			label: 'Saint Vincent and the Grenadines',
			phone: '1-784',
		},
		{ code: 'VE', label: 'Venezuela', phone: '58' },
		{
			code: 'VG',
			label: 'British Virgin Islands',
			phone: '1-284',
		},
		{
			code: 'VI',
			label: 'US Virgin Islands',
			phone: '1-340',
		},
		{ code: 'VN', label: 'Vietnam', phone: '84' },
		{ code: 'VU', label: 'Vanuatu', phone: '678' },
		{
			code: 'WF',
			label: 'Wallis and Futuna',
			phone: '681',
		},
		{ code: 'WS', label: 'Samoa', phone: '685' },
		{ code: 'XK', label: 'Kosovo', phone: '383' },
		{ code: 'YE', label: 'Yemen', phone: '967' },
		{ code: 'YT', label: 'Mayotte', phone: '262' },
		{ code: 'ZA', label: 'South Africa', phone: '27' },
		{ code: 'ZM', label: 'Zambia', phone: '260' },
		{ code: 'ZW', label: 'Zimbabwe', phone: '263' },
	].filter((country, i) =>
		carCountries.includes(country.code)
	);

	const handleSelectTagChange = event => {
		const {
			target: { value },
		} = event;
		setCarTag(
			// On autofill we get a stringified value.
			typeof value === 'string' ? value.split(',') : value
		);
	};

	const handleSelectTyreChange = event => {
		const {
			target: { value },
		} = event;
		setCarTyre(
			// On autofill we get a stringified value.
			typeof value === 'string' ? value.split(',') : value
		);
	};

	const handleSelectDriveTypeChange = event => {
		const {
			target: { value },
		} = event;
		setCarDriveType(
			// On autofill we get a stringified value.
			typeof value === 'string' ? value.split(',') : value
		);
	};

	const handleSelectBodyStyleChange = event => {
		const {
			target: { value },
		} = event;
		setBodyStyle(
			// On autofill we get a stringified value.
			typeof value === 'string' ? value.split(',') : value
		);
	};

	const handleSelectGcChange = event => {
		const {
			target: { value },
		} = event;
		setGc(
			// On autofill we get a stringified value.
			typeof value === 'string' ? value.split(',') : value
		);
	};

	const handleSearch = event => {
		setSearch(event.target.value);
		setPage(1);
	};

	const handleSelectChange = event => {
		setSelect(event.target.value);
		setPage(1);
	};

	const handleRQSliderChange = (
		event,
		newValue,
		activeThumb
	) => {
		setRqValue(newValue);
		if (!Array.isArray(newValue)) {
			return;
		}

		if (rqValue[1] - rqValue[0] < minDistance) {
			if (activeThumb === 0) {
				const clamped = Math.min(
					rqValue[0],
					highestRqValue - minDistance
				);
				setRqValue([clamped, clamped + minDistance]);
			} else {
				const clamped = Math.max(rqValue[1], minDistance);
				setRqValue([clamped - minDistance, clamped]);
			}
		} else {
			setRqValue(newValue);
		}
	};
	const handleTPSliderChange = (
		event,
		newValue,
		activeThumb
	) => {
		setTopSpeed(newValue);
		if (!Array.isArray(newValue)) {
			return;
		}

		if (topSpeed[1] - topSpeed[0] < minDistance) {
			if (activeThumb === 0) {
				const clamped = Math.min(
					topSpeed[0],
					highestCarSpeed - minDistance
				);
				setTopSpeed([clamped, clamped + minDistance]);
			} else {
				const clamped = Math.max(topSpeed[1], minDistance);
				setTopSpeed([clamped - minDistance, clamped]);
			}
		} else {
			setTopSpeed(newValue);
		}
	};
	const handleWeightSliderChange = (
		event,
		newValue,
		activeThumb
	) => {
		setWeight(newValue);
		if (!Array.isArray(newValue)) {
			return;
		}

		if (weight[1] - weight[0] < minDistance) {
			if (activeThumb === 0) {
				const clamped = Math.min(
					weight[0],
					highestWeight - minDistance
				);
				setWeight([clamped, clamped + minDistance]);
			} else {
				const clamped = Math.max(weight[1], minDistance);
				setWeight([clamped - minDistance, clamped]);
			}
		} else {
			setWeight(newValue);
		}
	};

	const handle0to60SliderChange = (
		event,
		newValue,
		activeThumb
	) => {
		setZeroTo60(newValue);
		if (!Array.isArray(newValue)) {
			return;
		}

		if (zeroTo60[1] - zeroTo60[0] < minDistance) {
			if (activeThumb === 0) {
				const clamped = Math.min(
					zeroTo60[0],
					highest0To60 - 1
				);
				setZeroTo60([clamped, clamped + minDistance]);
			} else {
				const clamped = Math.max(zeroTo60[1], 1);
				setZeroTo60([clamped - minDistance, clamped]);
			}
		} else {
			setZeroTo60(newValue);
		}
	};
	const handleHandlingSliderChange = (
		event,
		newValue,
		activeThumb
	) => {
		setHandling(newValue);
		if (!Array.isArray(newValue)) {
			return;
		}

		if (handling[1] - handling[0] < minDistance) {
			if (activeThumb === 0) {
				const clamped = Math.min(
					handling[0],
					highestHandling - minDistance
				);
				setHandling([clamped, clamped + minDistance]);
			} else {
				const clamped = Math.max(handling[1], minDistance);
				setHandling([clamped - minDistance, clamped]);
			}
		} else {
			setHandling(newValue);
		}
	};
	const handleYearSliderChange = (
		event,
		newValue,
		activeThumb
	) => {
		setYear(newValue);
		if (!Array.isArray(newValue)) {
			return;
		}

		if (year[1] - year[0] < minDistance) {
			if (activeThumb === 0) {
				const clamped = Math.min(
					year[0],
					highestYear - minDistance
				);
				setYear([clamped, clamped + minDistance]);
			} else {
				const clamped = Math.max(year[1], 1);
				setYear([clamped - minDistance, clamped]);
			}
		} else {
			setYear(newValue);
		}
	};
	const handleMraSliderChange = (
		event,
		newValue,
		activeThumb
	) => {
		setMra(newValue);
		if (!Array.isArray(newValue)) {
			return;
		}

		if (mra[1] - mra[0] < minDistance) {
			if (activeThumb === 0) {
				const clamped = Math.min(
					mra[0],
					highestMra - minDistance
				);
				setMra([clamped, clamped + minDistance]);
			} else {
				const clamped = Math.max(mra[1], 1);
				setMra([clamped - minDistance, clamped]);
			}
		} else {
			setMra(newValue);
		}
	};
	const handleOlaSliderChange = (
		event,
		newValue,
		activeThumb
	) => {
		setOla(newValue);
		if (!Array.isArray(newValue)) {
			return;
		}

		if (ola[1] - ola[0] < minDistance) {
			if (activeThumb === 0) {
				const clamped = Math.min(
					ola[0],
					highestOla - minDistance
				);
				setOla([clamped, clamped + minDistance]);
			} else {
				const clamped = Math.max(ola[1], 1);
				setOla([clamped - minDistance, clamped]);
			}
		} else {
			setOla(newValue);
		}
	};

	useEffect(() => {
		// console.log(lowestMra)
	}, []);

	const handleAccordion = panel => (event, isExpanded) => {
		setExpanded(isExpanded ? panel : false);
	};

	return (
		<Box id='searchBox'>
			{/* //? SEARCH AND RQ SLIDER */}
			<Accordion
				TransitionProps={{ unmountOnExit: true }}
				sx={{ width: { xs: '100%', md: '98%' } }}
				expanded={expanded === 'panel1'}
				onChange={handleAccordion('panel1')}>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls='panel1bh-content'
					id='panel1bh-header'>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-around',
							width: '100%',
							flexWrap: 'wrap',
						}}>
						<Typography>Search</Typography>
						<Typography>CR</Typography>
						<Typography>Make</Typography>
						<Typography>Tags</Typography>
						<Typography>Country</Typography>
						<Typography>Tyre Type</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails>
					<Box
						sx={{
							width: { xs: '100%', md: '98%' },
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: { xs: 'column', md: 'row' },
							gap: 2,
						}}>
						<TextField
							sx={{ minWidth: '30%' }}
							color='secondary'
							id='standard-basic'
							label='Search'
							variant='outlined'
							value={search}
							onChange={handleSearch}
						/>
						{/* {carsSortType[1] === "ascend" ?
            <Button sx={{ fontSize: "20px" }} onClick={() => setCarsSortType(["RQ", "descend"])}>
              <KeyboardArrowDownIcon /> RQ
            </Button>
            :
            <Button color="secondary" sx={{ fontSize: "20px" }} onClick={() => setCarsSortType(["RQ", "ascend"])}>
              <KeyboardArrowUpIcon /> RQ
            </Button>} */}
						<Stack
							direction='row'
							gap={1}
							alignItems='center'
							sx={{ width: '100%' }}>
							<Typography sx={{ mr: 1 }}> CR </Typography>
							<Slider
								getAriaLabel={() => 'CR'}
								value={rqValue}
								onChange={handleRQSliderChange}
								valueLabelDisplay='auto'
								getAriaValueText={rqSliderValuetext}
								valueLabelFormat={rqSliderValuetext}
								disableSwap
								min={lowestRqValue}
								max={highestRqValue}
							/>
						</Stack>
						<Stack
							direction='row'
							gap={1}
							alignItems='center'
							mt={{ md: 0, xs: -3 }}>
							<TextField
								placeholder='Min CR'
								inputProps={{
									inputMode: 'numeric',
									pattern: '[0-9]*',
								}}
								onChange={e =>
									setRqValue([e.target.value, rqValue[1]])
								}
								value={rqValue[0]}
							/>
							<TextField
								placeholder='Max CR'
								onChange={e =>
									setRqValue([rqValue[0], e.target.value])
								}
								value={rqValue[1]}
							/>
						</Stack>
					</Box>
					{/* //? MAKE AND TAGS SELECT */}
					<Box
						sx={{
							mb: 1,
							mt: 1,
							width: { xs: '100%', md: '98%' },
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: { xs: 'column', md: 'row' },
							gap: 2,
						}}>
						<Autocomplete
							limitTags={3}
							multiple
							value={carMake}
							sx={{ width: '100%' }}
							options={carMakes}
							autoHighlight
							onChange={(event, newValue) => {
								setCarMake(newValue);
							}}
							getOptionLabel={option => option}
							renderOption={(props, option) => (
								<Box
									component='li'
									sx={{
										'& > img': { mr: 2, flexShrink: 0 },
									}}
									{...props}>
									{option}
								</Box>
							)}
							renderInput={params => (
								<TextField
									{...params}
									label='Make'
									inputProps={{
										...params.inputProps,
										autoComplete: 'new-password', // disable autocomplete and autofill
									}}
								/>
							)}
						/>
						<Autocomplete
							limitTags={3}
							multiple
							value={carTag}
							sx={{ width: '100%' }}
							options={carTags}
							autoHighlight
							onChange={(event, newValue) => {
								setCarTag(newValue);
							}}
							getOptionLabel={option => option}
							renderOption={(props, option) => (
								<Box
									component='li'
									sx={{
										'& > img': { mr: 2, flexShrink: 0 },
									}}
									{...props}>
									{option}
								</Box>
							)}
							renderInput={params => (
								<TextField
									{...params}
									label='Tags'
									inputProps={{
										...params.inputProps,
										autoComplete: 'new-password', // disable autocomplete and autofill
									}}
								/>
							)}
						/>
					</Box>

					{/* //? COUNTRY AND TYRE TYPE SELECTS */}
					<Box
						sx={{
							mb: 1,
							width: { xs: '100%', md: '98%' },
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: { xs: 'column', md: 'row' },
							gap: 2,
						}}>
						<Autocomplete
							limitTags={4}
							multiple
							value={carCountryValue}
							id='country-select-demo'
							sx={{ width: '100%' }}
							options={countries}
							autoHighlight
							onChange={(event, newValue) => {
								setCarCountryValue(newValue);
							}}
							getOptionLabel={option => option.label}
							renderOption={(props, option) => (
								<Box
									component='li'
									sx={{
										'& > img': { mr: 2, flexShrink: 0 },
									}}
									{...props}>
									<img
										loading='lazy'
										width='20'
										src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
										srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
										alt=''
									/>
									{option.label} {option.code}
								</Box>
							)}
							renderInput={params => (
								<TextField
									{...params}
									label='Country'
									inputProps={{
										...params.inputProps,
										autoComplete: 'new-password', // disable autocomplete and autofill
									}}
								/>
							)}
						/>

						<FormControl sx={{ width: '100%' }}>
							<InputLabel id='demo-multiple-checkbox-label'>
								Tyre Type
							</InputLabel>
							<Select
								labelId='demo-multiple-checkbox-label'
								id='demo-multiple-checkbox'
								multiple
								value={carTyre}
								onChange={handleSelectTyreChange}
								input={<OutlinedInput label='Tyre Type' />}
								renderValue={selected =>
									selected.join(', ')
								}
								MenuProps={MenuProps}>
								{carTyres.sort().map(name => (
									<MenuItem
										key={name}
										value={name}>
										<Checkbox
											color='success'
											checked={carTyre.indexOf(name) > -1}
										/>
										<ListItemText primary={name} />
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				</AccordionDetails>
			</Accordion>

			{/* //? DRIVE TYPE AND TOP SPEED SLIDER */}
			<Accordion
				TransitionProps={{ unmountOnExit: true }}
				sx={{ width: { xs: '100%', md: '98%' } }}
				expanded={expanded === 'panel2'}
				onChange={handleAccordion('panel2')}>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls='panel1bh-content'
					id='panel1bh-header'>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-around',
							width: '100%',
							flexWrap: 'wrap',
						}}>
						<Typography>Drive Type</Typography>
						<Typography>Top Speed</Typography>
						<Typography>Sort</Typography>
						<Typography>0-60</Typography>
						<Typography>Handling</Typography>
						<Typography>Year</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails>
					<Box
						sx={{
							mb: 1,
							width: { xs: '100%', md: '98%' },
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: { xs: 'column', md: 'row' },
							gap: 2,
						}}>
						<FormControl sx={{ mb: 1, width: '100%' }}>
							<InputLabel id='demo-multiple-checkbox-label'>
								Drive Type
							</InputLabel>
							<Select
								labelId='demo-multiple-checkbox-label'
								id='demo-multiple-checkbox'
								multiple
								value={carDriveType}
								onChange={handleSelectDriveTypeChange}
								input={<OutlinedInput label='Drive Type' />}
								renderValue={selected =>
									selected.join(', ')
								}
								MenuProps={MenuProps}>
								{carDriveTypes.map(name => (
									<MenuItem
										key={name}
										value={name}>
										<Checkbox
											color='success'
											checked={
												carDriveType.indexOf(name) > -1
											}
										/>
										<ListItemText primary={name} />
									</MenuItem>
								))}
							</Select>
						</FormControl>
						<Stack
							direction='row'
							gap={1}
							alignItems='center'
							sx={{ width: '100%' }}>
							<Typography sx={{ width: '6rem', mr: 1 }}>
								{' '}
								Top Speed{' '}
							</Typography>
							<Slider
								sx={{ mr: 1 }}
								getAriaLabel={() => 'Top Speed'}
								value={topSpeed}
								onChange={handleTPSliderChange}
								valueLabelDisplay='auto'
								getAriaValueText={tpSliderValuetext}
								valueLabelFormat={tpSliderValuetext}
								disableSwap
								min={lowestCarSpeed}
								max={highestCarSpeed}
							/>
						</Stack>
					</Box>

					{/* //? SORT AND 0-60 SLIDER */}
					<Box
						sx={{
							mb: 1,
							width: { xs: '100%', md: '98%' },
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: { xs: 'column', md: 'row' },
							gap: 2,
						}}>
						<FormControl sx={{ width: '100%' }}>
							<InputLabel htmlFor='grouped-select'>
								Sort
							</InputLabel>
							<Select
								defaultValue={2}
								value={carsSortType}
								onChange={e =>
									setCarsSortType(e.target.value)
								}
								label='Sort'>
								<ListSubheader
									sx={{ bgcolor: 'background.paper2' }}
									color='primary'>
									CR Sort
								</ListSubheader>
								<MenuItem value={1}>
									CR: Ascending order {'<'}
								</MenuItem>
								<MenuItem value={2}>
									CR: Descending order {'>'}
								</MenuItem>
								<ListSubheader
									sx={{ bgcolor: 'background.paper2' }}>
									Top Speed Sort
								</ListSubheader>
								<MenuItem value={3}>
									TP: Ascending order {'<'}
								</MenuItem>
								<MenuItem value={4}>
									TP: Descending order {'>'}
								</MenuItem>
								<ListSubheader
									sx={{ bgcolor: 'background.paper2' }}>
									0-60 Sort
								</ListSubheader>
								<MenuItem value={5}>
									0-60: Ascending order {'<'}
								</MenuItem>
								<MenuItem value={6}>
									0-60: Descending order {'>'}
								</MenuItem>
								<ListSubheader
									sx={{ bgcolor: 'background.paper2' }}>
									Handling Sort
								</ListSubheader>
								<MenuItem value={7}>
									Handling: Ascending order {'<'}
								</MenuItem>
								<MenuItem value={8}>
									Handling: Descending order {'>'}
								</MenuItem>
								<ListSubheader
									sx={{ bgcolor: 'background.paper2' }}>
									Year Sort
								</ListSubheader>
								<MenuItem value={9}>
									Year: Ascending order {'<'}
								</MenuItem>
								<MenuItem value={10}>
									Year: Descending order {'>'}
								</MenuItem>
								<ListSubheader
									sx={{ bgcolor: 'background.paper2' }}>
									MRA Sort
								</ListSubheader>
								<MenuItem value={11}>
									MRA: Ascending order {'<'}
								</MenuItem>
								<MenuItem value={12}>
									MRA: Descending order {'>'}
								</MenuItem>
								<ListSubheader
									sx={{ bgcolor: 'background.paper2' }}>
									OLA Sort
								</ListSubheader>
								<MenuItem value={13}>
									OLA: Ascending order {'<'}
								</MenuItem>
								<MenuItem value={14}>
									OLA: Descending order {'>'}
								</MenuItem>
								<ListSubheader
									sx={{ bgcolor: 'background.paper2' }}>
									Weight Sort
								</ListSubheader>
								<MenuItem value={15}>
									Weight: Ascending order {'<'}
								</MenuItem>
								<MenuItem value={16}>
									Weight: Descending order {'>'}
								</MenuItem>
							</Select>
						</FormControl>
						<Stack
							direction='row'
							gap={1}
							alignItems='center'
							sx={{ width: '100%' }}>
							<Typography sx={{ width: '3rem', mr: 1 }}>
								{' '}
								0-60{' '}
							</Typography>
							<Slider
								sx={{ mr: 1 }}
								getAriaLabel={() => 'Top Speed'}
								value={zeroTo60}
								onChange={handle0to60SliderChange}
								valueLabelDisplay='auto'
								getAriaValueText={zero60SliderValuetext}
								valueLabelFormat={zero60SliderValuetext}
								disableSwap
								min={lowest0To60}
								max={highest0To60}
							/>
						</Stack>
						<Stack
							direction='row'
							gap={1}
							alignItems='center'
							mt={{ md: 0, xs: -3 }}>
							<TextField
								placeholder='Min 0-60'
								onChange={e =>
									setZeroTo60([e.target.value, zeroTo60[1]])
								}
								value={zeroTo60[0]}
							/>
							<TextField
								placeholder='Max 0-60'
								onChange={e =>
									setZeroTo60([zeroTo60[0], e.target.value])
								}
								value={zeroTo60[1]}
							/>
						</Stack>
					</Box>

					{/* //? HANDLING AND YEAR SLIDERS */}
					<Box
						sx={{
							mb: 1,
							width: { xs: '100%', md: '98%' },
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-start',
							flexDirection: { xs: 'column', md: 'row' },
							gap: 2,
						}}>
						<Stack
							direction='row'
							gap={1}
							alignItems='center'
							justifyContent='flex-start'
							sx={{ width: '100%' }}>
							<Typography sx={{ width: '5rem', mr: 1 }}>
								{' '}
								Handling{' '}
							</Typography>
							<Slider
								sx={{ mr: 1 }}
								getAriaLabel={() => 'Top Speed'}
								value={handling}
								onChange={handleHandlingSliderChange}
								valueLabelDisplay='auto'
								getAriaValueText={handlingSliderValuetext}
								valueLabelFormat={handlingSliderValuetext}
								disableSwap
								min={lowestHandling}
								max={highestHandling}
							/>
						</Stack>
						<Stack
							direction='row'
							gap={1}
							alignItems='center'
							justifyContent='flex-start'
							sx={{ width: '100%' }}>
							<Typography sx={{ mr: 1 }}> Year </Typography>
							<Slider
								sx={{ mr: 1 }}
								getAriaLabel={() => 'Top Speed'}
								value={year}
								onChange={handleYearSliderChange}
								valueLabelDisplay='auto'
								getAriaValueText={yearSliderValuetext}
								valueLabelFormat={yearSliderValuetext}
								disableSwap
								min={lowestYear}
								max={highestYear}
							/>
						</Stack>
					</Box>
				</AccordionDetails>
			</Accordion>

			{/* //? MRA AND OLA SLIDERS */}
			<Accordion
				TransitionProps={{ unmountOnExit: true }}
				sx={{ mb: 1, width: { xs: '100%', md: '98%' } }}
				expanded={expanded === 'panel3'}
				onChange={handleAccordion('panel3')}>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls='panel1bh-content'
					id='panel1bh-header'>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-around',
							width: '100%',
							flexWrap: 'wrap',
						}}>
						<Typography>MRA</Typography>
						<Typography>OLA</Typography>
						<Typography>Body Style</Typography>
						<Typography>Weight</Typography>
						<Typography>Fuel Type</Typography>
						<Typography>Ground Clearance</Typography>
					</Box>
				</AccordionSummary>
				<AccordionDetails>
					<Box
						sx={{
							mb: 1,
							width: { xs: '100%', md: '98%' },
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-start',
							flexDirection: { xs: 'column', md: 'row' },
							gap: 2,
						}}>
						<Stack
							direction='row'
							gap={1}
							alignItems='center'
							justifyContent='flex-start'
							sx={{ width: '100%' }}>
							<Typography sx={{ mr: 1 }}> MRA </Typography>
							<Slider
								sx={{ mr: 1 }}
								getAriaLabel={() => 'Top Speed'}
								value={mra}
								onChange={handleMraSliderChange}
								valueLabelDisplay='auto'
								getAriaValueText={mraSliderValuetext}
								valueLabelFormat={mraSliderValuetext}
								disableSwap
								min={lowestMra}
								max={highestMra}
							/>
						</Stack>
						<Stack
							direction='row'
							gap={1}
							alignItems='center'
							mt={{ md: 0, xs: -3 }}>
							<TextField
								placeholder='Min MRA'
								inputProps={{
									inputMode: 'numeric',
									pattern: '[0-9]*',
								}}
								onChange={e =>
									setMra([e.target.value, mra[1]])
								}
								value={mra[0]}
							/>
							<TextField
								placeholder='Max MRA'
								onChange={e =>
									setMra([mra[0], e.target.value])
								}
								value={mra[1]}
							/>
						</Stack>
						<Stack
							direction='row'
							gap={1}
							alignItems='center'
							justifyContent='flex-start'
							sx={{ width: '100%' }}>
							<Typography sx={{ mr: 1 }}> OLA </Typography>
							<Slider
								sx={{ mr: 1 }}
								getAriaLabel={() => 'Top Speed'}
								value={ola}
								onChange={handleOlaSliderChange}
								valueLabelDisplay='auto'
								getAriaValueText={olaSliderValuetext}
								valueLabelFormat={olaSliderValuetext}
								disableSwap
								min={lowestOla}
								max={highestOla}
							/>
						</Stack>
						<Stack
							direction='row'
							gap={1}
							alignItems='center'
							mt={{ md: 0, xs: -3 }}>
							<TextField
								placeholder='Min OLA'
								inputProps={{
									inputMode: 'numeric',
									pattern: '[0-9]*',
								}}
								onChange={e =>
									setOla([e.target.value, ola[1]])
								}
								value={ola[0]}
							/>
							<TextField
								placeholder='Max OLA'
								onChange={e =>
									setOla([ola[0], e.target.value])
								}
								value={ola[1]}
							/>
						</Stack>
					</Box>

					{/* //? BODYSTYLE AND CREATOR SELECTS */}
					<Box
						sx={{
							mb: 1,
							width: { xs: '100%', md: '98%' },
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-start',
							flexDirection: { xs: 'column', md: 'row' },
							gap: 2,
						}}>
						<Autocomplete
							limitTags={3}
							multiple
							value={bodyStyle}
							sx={{ width: '100%' }}
							options={bodyStyles}
							autoHighlight
							onChange={(event, newValue) => {
								setBodyStyle(newValue);
							}}
							getOptionLabel={option => option}
							renderOption={(props, option) => (
								<Box
									component='li'
									sx={{
										'& > img': { mr: 2, flexShrink: 0 },
									}}
									{...props}>
									{option}
								</Box>
							)}
							renderInput={params => (
								<TextField
									{...params}
									label='Body Style'
									inputProps={{
										...params.inputProps,
										autoComplete: 'new-password', // disable autocomplete and autofill
									}}
								/>
							)}
						/>

						<Stack
							direction='row'
							gap={1}
							alignItems='center'
							sx={{ width: '100%' }}>
							<Typography sx={{ width: '5rem' }}>
								{' '}
								Weight{' '}
							</Typography>
							<Slider
								sx={{ mr: 1 }}
								getAriaLabel={() => 'Weight'}
								value={weight}
								onChange={handleWeightSliderChange}
								valueLabelDisplay='auto'
								getAriaValueText={weightSliderValuetext}
								valueLabelFormat={weightSliderValuetext}
								disableSwap
								min={lowestWeight}
								max={highestWeight}
							/>
						</Stack>
					</Box>

					{/* //? FUEL TYPE AND GC */}
					<Box
						sx={{
							mb: 1,
							width: { xs: '100%', md: '98%' },
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'flex-start',
							flexDirection: { xs: 'column', md: 'row' },
							gap: 2,
						}}>
						<Autocomplete
							limitTags={3}
							multiple
							value={fuelType}
							sx={{ width: '100%' }}
							options={carFuelTypes}
							autoHighlight
							onChange={(event, newValue) => {
								setFuelType(newValue);
							}}
							getOptionLabel={option => option}
							renderOption={(props, option) => (
								<Box
									component='li'
									sx={{
										'& > img': { mr: 2, flexShrink: 0 },
									}}
									{...props}>
									{option}
								</Box>
							)}
							renderInput={params => (
								<TextField
									{...params}
									label='Fuel Type'
									inputProps={{
										...params.inputProps,
										autoComplete: 'new-password', // disable autocomplete and autofill
									}}
								/>
							)}
						/>

						<FormControl sx={{ width: '100%' }}>
							<InputLabel id='demo-multiple-checkbox-label'>
								Ground Clearances
							</InputLabel>
							<Select
								labelId='demo-multiple-checkbox-label'
								id='demo-multiple-checkbox'
								multiple
								value={gc}
								onChange={handleSelectGcChange}
								input={
									<OutlinedInput label='Ground Clearances' />
								}
								renderValue={selected =>
									selected.join(', ')
								}
								MenuProps={MenuProps}>
								{carGcs.map((name, i) => (
									<MenuItem
										key={i}
										value={name}>
										<Checkbox
											color='success'
											checked={gc.indexOf(name) > -1}
										/>
										<ListItemText primary={name} />
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Box>
				</AccordionDetails>
			</Accordion>

			{/* //? CARS PER PAGE, CREATOR AND PRIZE */}
			<Box
				sx={{
					mb: 1,
					width: { xs: '100%', md: '98%' },
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'flex-start',
					flexDirection: { xs: 'column', md: 'row' },
					gap: 2,
				}}>
				<FormControl fullWidth>
					<InputLabel id='demo-simple-select-label'>
						Cars per page
					</InputLabel>
					<Select
						labelId='demo-simple-select-label'
						id='demo-simple-select'
						value={numOfCars / 5}
						label='Cars per page'
						onChange={e => setNumOfCars(e.target.value * 5)}
						defaultValue={2}>
						<MenuItem value={1}>5</MenuItem>
						<MenuItem value={2}>10</MenuItem>
						<MenuItem value={3}>15</MenuItem>
						<MenuItem value={4}>20</MenuItem>
						<MenuItem value={8}>40</MenuItem>
					</Select>
				</FormControl>

				<Autocomplete
					limitTags={2}
					multiple
					value={creator}
					sx={{ width: '100%' }}
					options={creators}
					autoHighlight
					onChange={(event, newValue) => {
						setCreator(newValue);
					}}
					getOptionLabel={option => option}
					renderOption={(props, option) => (
						<Box
							component='li'
							sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
							{...props}>
							{option}
						</Box>
					)}
					renderInput={params => (
						<TextField
							{...params}
							label='Creators'
							inputProps={{
								...params.inputProps,
								autoComplete: 'new-password', // disable autocomplete and autofill
							}}
						/>
					)}
				/>

				<FormControl fullWidth>
					<InputLabel id='demo-simple-select-label'>
						Prize cars
					</InputLabel>
					<Select
						labelId='demo-simple-select-label'
						id='demo-simple-select'
						value={prize}
						label='Prize cars'
						onChange={e => setPrize(e.target.value)}
						defaultValue={1}>
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
