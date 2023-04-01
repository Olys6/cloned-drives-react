import { useEffect, useState } from 'react';
import carData from '../data/data.js';
import { Pagination, Stack } from '@mui/material';

import Logo from '../images/logowhite.png';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import CarFilter from './CarFilter.jsx';
import Cards from './Cards.jsx';

let highestRqValue = 0;
let highestCarSpeed = 0;
let highest0To60 = 0;
let highestHandling = 0;
let highestYear = 0;
let highestMra = 0;
let highestOla = 0;
let highestWeight = 0;

let lowestRqValue = 10000;
let lowestCarSpeed = 10000;
let lowest0To60 = 10000;
let lowestHandling = 10000;
let lowestYear = 10000;
let lowestMra = 10000;
let lowestOla = 10000;
let lowestWeight = 10000;

const getHighestAndLowestValues = () => {
	carData.forEach((car) => {
		highestRqValue < car.rq ? (highestRqValue = car.rq) : null;
		highestCarSpeed < car.topSpeed ? (highestCarSpeed = car.topSpeed) : null;
		highest0To60 < car['0to60'] ? (highest0To60 = car['0to60']) : null;
		highestHandling < car.handling ? (highestHandling = car.handling) : null;
		highestYear < car.modelYear ? (highestYear = car.modelYear) : null;
		highestMra < car.mra ? (highestMra = car.mra) : null;
		highestOla < car.ola ? (highestOla = car.ola) : null;
		highestWeight < car.weight ? (highestWeight = car.weight) : null;

		lowestRqValue > car.rq ? (lowestRqValue = car.rq) : null;
		lowestCarSpeed > car.topSpeed ? (lowestCarSpeed = car.topSpeed) : null;
		lowest0To60 > car['0to60'] ? (lowest0To60 = car['0to60']) : null;
		lowestHandling > car.handling ? (lowestHandling = car.handling) : null;
		lowestYear > car.modelYear ? (lowestYear = car.modelYear) : null;
		lowestMra > car.mra ? (lowestMra = car.mra) : null;
		lowestOla > car.ola ? (lowestOla = car.ola) : null;
		lowestWeight > car.weight ? (lowestWeight = car.weight) : null;
		lowestWeight > car.weight ? (lowestWeight = car.weight) : null;
	});
};

getHighestAndLowestValues();

const Home = () => {
	const [search, setSearch] = useState('');
	const [select, setSelect] = useState('all');
	const [page, setPage] = useState(1);
	const [rqValue, setRqValue] = useState([lowestRqValue, highestRqValue]);
	const [carsSortType, setCarsSortType] = useState(2);
	const [carTag, setCarTag] = useState([]);
	const [carCountryValue, setCarCountryValue] = useState([]);
	const [carMake, setCarMake] = useState([]);
	const [carTyre, setCarTyre] = useState([]);
	const [carDriveType, setCarDriveType] = useState([]);
	const [topSpeed, setTopSpeed] = useState([lowestCarSpeed, highestCarSpeed]);
	const [zeroTo60, setZeroTo60] = useState([lowest0To60, highest0To60]);
	const [handling, setHandling] = useState([lowestHandling, highestHandling]);
	const [year, setYear] = useState([lowestYear, highestYear]);
	const [mra, setMra] = useState([lowestMra, highestMra]);
	const [ola, setOla] = useState([lowestOla, highestOla]);
	const [bodyStyle, setBodyStyle] = useState([]);
	const [creator, setCreator] = useState([]);
	const [numOfCars, setNumOfCars] = useState(10);
	const [prize, setPrize] = useState(1);
	const [fuelType, setFuelType] = useState([]);
	const [gc, setGc] = useState([]);
	const [weight, setWeight] = useState([lowestWeight, highestWeight]);
	// { Array.isArray(car.make) ? car.make[0] : car.make }
	const carTags = [];

	// const smallCarData = carData.map((car, i) => (i < 20 ? car : <></>))

	const handlePageChange = (event, value) => {
		setPage(value);
	};

	const filteredCars = () => {
		const regexSearch = new RegExp(`\\b${search}`, 'i');
		return carData.filter((car) => {
			return (
				(regexSearch.exec(Array.isArray(car.make) ? car.make[0] : car.make) ||
					regexSearch.exec(car.model) ||
					regexSearch.exec(
						Array.isArray(car.make)
							? `${car.make[0]} ${car.model}`
							: `${car.make} ${car.model}`
					)) &&
				car.rq <= rqValue[1] &&
				car.rq >= rqValue[0] &&
				car.topSpeed <= topSpeed[1] &&
				car.topSpeed >= topSpeed[0] &&
				car['0to60'] <= zeroTo60[1] &&
				car['0to60'] >= zeroTo60[0] &&
				car.handling <= handling[1] &&
				car.handling >= handling[0] &&
				car.modelYear <= year[1] &&
				car.modelYear >= year[0] &&
				car.mra <= mra[1] &&
				car.mra >= mra[0] &&
				car.ola <= ola[1] &&
				car.ola >= ola[0] &&
				car.weight <= weight[1] &&
				car.weight >= weight[0] &&
				(carMake.length > 0
					? carMake.some((elem) => car.make.includes(elem))
					: true) &&
				(carTag.length > 0
					? carTag.some((elem) => car.tags.includes(elem))
					: true) &&
				(carCountryValue.length > 0
					? carCountryValue.some((elem) => elem.code === car.country)
					: true) &&
				(carTyre.length > 0
					? carTyre.some((elem) => elem === car.tyreType)
					: true) &&
				(carDriveType.length > 0
					? carDriveType.some((elem) => elem === car.driveType)
					: true) &&
				(bodyStyle.length > 0
					? bodyStyle.some((elem) => elem === car.bodyStyle)
					: true) &&
				(creator.length > 0
					? creator.some((elem) => elem === car.creator)
					: true) &&
				(fuelType.length > 0
					? fuelType.some((elem) => elem === car.fuelType)
					: true) &&
				(gc.length > 0 ? gc.some((elem) => elem === car.gc) : true) &&
				(prize > 1 ? (prize === 2 ? car.isPrize : car.isPrize === false) : true)
			);
		});
	};

	useEffect(() => {
		filteredCars();
	}, [rqValue]);

	const getAllTags = () =>
		carData.forEach((car) => {
			if (Array.isArray(car.tags) && car.tags.length > 0) {
				car.tags.forEach((tag) => {
					if (!carTags.includes(tag)) {
						carTags.push(tag);
					}
				});
			}
		});

	useEffect(() => {
		getAllTags();
		// console.log("CAR TAGS --->", carTags)
	}, []);

	return (
		<>
			<CarFilter
				weight={weight}
				lowestWeight={lowestWeight}
				highestWeight={highestWeight}
				setWeight={setWeight}
				gc={gc}
				setGc={setGc}
				fuelType={fuelType}
				setFuelType={setFuelType}
				prize={prize}
				setPrize={setPrize}
				numOfCars={numOfCars}
				setNumOfCars={setNumOfCars}
				creator={creator}
				setCreator={setCreator}
				bodyStyle={bodyStyle}
				setBodyStyle={setBodyStyle}
				highestOla={highestOla}
				lowestOla={lowestOla}
				ola={ola}
				setOla={setOla}
				highestMra={highestMra}
				lowestMra={lowestMra}
				mra={mra}
				setMra={setMra}
				setYear={setYear}
				year={year}
				highestYear={highestYear}
				lowestYear={lowestYear}
				highestHandling={highestHandling}
				lowestHandling={lowestHandling}
				handling={handling}
				setHandling={setHandling}
				zeroTo60={zeroTo60}
				setZeroTo60={setZeroTo60}
				highest0To60={highest0To60}
				lowest0To60={lowest0To60}
				highestRqValue={highestRqValue}
				lowestRqValue={lowestRqValue}
				highestCarSpeed={highestCarSpeed}
				lowestCarSpeed={lowestCarSpeed}
				topSpeed={topSpeed}
				setTopSpeed={setTopSpeed}
				carDriveType={carDriveType}
				setCarDriveType={setCarDriveType}
				carTyre={carTyre}
				setCarTyre={setCarTyre}
				carMake={carMake}
				setCarMake={setCarMake}
				carCountryValue={carCountryValue}
				setCarCountryValue={setCarCountryValue}
				carTag={carTag}
				setCarTag={setCarTag}
				carTags={carTags}
				setCarsSortType={setCarsSortType}
				carsSortType={carsSortType}
				setSearch={setSearch}
				search={search}
				setRqValue={setRqValue}
				rqValue={rqValue}
				setPage={setPage}
			/>

			<Cards
				carsSortType={carsSortType}
				filteredCars={filteredCars}
				page={page}
				numOfCars={numOfCars}
			/>

			<Stack>
				<Pagination
					sx={{
						width: '100%',
						display: 'flex',
						justifyContent: 'center',
						alignItem: 'center',
					}}
					size='large'
					count={Math.ceil(filteredCars().length / numOfCars)}
					onChange={handlePageChange}
					page={page}
					variant='outlined'
					color='primary'
					shape='rounded'
				/>
			</Stack>
		</>
	);
};

export default Home;
