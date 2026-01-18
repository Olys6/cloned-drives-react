import { useState } from 'react';
import { Pagination, Stack, Typography, Box } from '@mui/material';

// You'll need to create this file by running your tracksmerge.js
// and saving the output as trackData.js in your data folder
import trackData from '../data/trackData.js';

import TrackFilter from './TrackFilter.jsx';
import TrackCards from './TrackCards.jsx';

// Get unique values for filters
const getUniqueValues = (key) => {
	const values = new Set();
	trackData.forEach(track => {
		if (track[key]) values.add(track[key]);
	});
	return Array.from(values).sort();
};

const weatherOptions = getUniqueValues('weather');
const surfaceOptions = getUniqueValues('surface');

const TrackList = () => {
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [numOfTracks, setNumOfTracks] = useState(12);
	const [weather, setWeather] = useState([]);
	const [surface, setSurface] = useState([]);
	const [tracksSortType, setTracksSortType] = useState(1);
	const [hasSpeedbumps, setHasSpeedbumps] = useState('all');
	const [hasHumps, setHasHumps] = useState('all');

	const handlePageChange = (event, value) => {
		setPage(value);
	};

	const filteredTracks = () => {
		const regexSearch = new RegExp(search, 'i');
		return trackData.filter(track => {
			return (
				regexSearch.test(track.trackName) &&
				(weather.length > 0 ? weather.includes(track.weather) : true) &&
				(surface.length > 0 ? surface.includes(track.surface) : true) &&
				(hasSpeedbumps === 'all' ? true : 
					hasSpeedbumps === 'yes' ? track.speedbumps > 0 : track.speedbumps === 0) &&
				(hasHumps === 'all' ? true : 
					hasHumps === 'yes' ? track.humps > 0 : track.humps === 0)
			);
		});
	};

	return (
		<>
			<Box sx={{ pt: 2, pb: 2 }}>
				<Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
					Track List ({filteredTracks().length} tracks)
				</Typography>
			</Box>

			<TrackFilter
				search={search}
				setSearch={setSearch}
				weather={weather}
				setWeather={setWeather}
				weatherOptions={weatherOptions}
				surface={surface}
				setSurface={setSurface}
				surfaceOptions={surfaceOptions}
				tracksSortType={tracksSortType}
				setTracksSortType={setTracksSortType}
				numOfTracks={numOfTracks}
				setNumOfTracks={setNumOfTracks}
				hasSpeedbumps={hasSpeedbumps}
				setHasSpeedbumps={setHasSpeedbumps}
				hasHumps={hasHumps}
				setHasHumps={setHasHumps}
				setPage={setPage}
			/>

			<TrackCards
				filteredTracks={filteredTracks}
				page={page}
				numOfTracks={numOfTracks}
				tracksSortType={tracksSortType}
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
					count={Math.ceil(filteredTracks().length / numOfTracks)}
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

export default TrackList;
