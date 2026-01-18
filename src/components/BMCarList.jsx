import { useState } from 'react';
import { Pagination, Stack, Typography, Box } from '@mui/material';

// Uses the same car data as the main car list
import carData from '../data/data.js';

import BMCarFilter from './BMCarFilter.jsx';
import BMCarCards from './BMCarCards.jsx';

// Filter to only BM cars (cars with a "reference" field)
const bmCarData = carData.filter(car => car.reference);

// Get unique values for filters
const getUniqueValues = (key) => {
	const values = new Set();
	bmCarData.forEach(car => {
		if (car[key]) {
			if (Array.isArray(car[key])) {
				car[key].forEach(v => values.add(v));
			} else {
				values.add(car[key]);
			}
		}
	});
	return Array.from(values).sort();
};

// Get all unique collections
const getCollections = () => {
	const collections = new Set();
	bmCarData.forEach(car => {
		if (car.collection && Array.isArray(car.collection)) {
			car.collection.forEach(c => collections.add(c));
		} else if (car.collection) {
			collections.add(car.collection);
		}
	});
	return Array.from(collections).sort();
};

const collectionOptions = getCollections();
const creatorOptions = getUniqueValues('creator');

const BMCarList = () => {
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [numOfCars, setNumOfCars] = useState(12);
	const [sortType, setSortType] = useState(1);
	const [collection, setCollection] = useState([]);
	const [creator, setCreator] = useState([]);
	const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'

	const handlePageChange = (event, value) => {
		setPage(value);
	};

	const filteredCars = () => {
		const regexSearch = new RegExp(search, 'i');
		return bmCarData.filter(car => {
			// Search by model name or make
			const makeStr = Array.isArray(car.make) ? car.make.join(' ') : car.make;
			const matchesSearch = regexSearch.test(car.model) || 
				regexSearch.test(makeStr) ||
				regexSearch.test(`${makeStr} ${car.model}`) ||
				regexSearch.test(car.carID);

			// Collection filter
			const matchesCollection = collection.length === 0 ||
				(car.collection && (
					Array.isArray(car.collection) 
						? car.collection.some(c => collection.includes(c))
						: collection.includes(car.collection)
				));

			// Creator filter
			const matchesCreator = creator.length === 0 ||
				(car.creator && creator.includes(car.creator));

			// Active filter
			let matchesActive = true;
			if (activeFilter === 'active') {
				matchesActive = car.active === true;
			} else if (activeFilter === 'inactive') {
				matchesActive = car.active === false;
			}

			return matchesSearch && matchesCollection && matchesCreator && matchesActive;
		});
	};

	return (
		<>
			<Box sx={{ pt: 2, pb: 2 }}>
				<Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
					Black Market Car List
				</Typography>
				<Typography variant="subtitle1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
					{filteredCars().length} Black Market cars
				</Typography>
			</Box>

			<BMCarFilter
				search={search}
				setSearch={setSearch}
				sortType={sortType}
				setSortType={setSortType}
				numOfCars={numOfCars}
				setNumOfCars={setNumOfCars}
				collection={collection}
				setCollection={setCollection}
				collectionOptions={collectionOptions}
				creator={creator}
				setCreator={setCreator}
				creatorOptions={creatorOptions}
				activeFilter={activeFilter}
				setActiveFilter={setActiveFilter}
				setPage={setPage}
			/>

			<BMCarCards
				filteredCars={filteredCars}
				page={page}
				numOfCars={numOfCars}
				sortType={sortType}
				allCarData={carData}
			/>

			<Stack sx={{ pb: 4 }}>
				<Pagination
					sx={{
						width: '100%',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
					size="large"
					count={Math.ceil(filteredCars().length / numOfCars)}
					onChange={handlePageChange}
					page={page}
					variant="outlined"
					color="primary"
					shape="rounded"
				/>
			</Stack>
		</>
	);
};

export default BMCarList;
