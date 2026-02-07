import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { themeOptions } from './Theme';

import Navbar from './components/Navbar.jsx';
import Home from './components/Home.jsx';
import Creation from './components/Creation.jsx';
import NoMatch from './components/NoMatch.jsx';
import Footer from './components/Footer.jsx';
import FrontPage from './components/FrontPage';
import TrackList from './components/TrackList';
import PackList from './components/PackList';
import BMCarList from './components/BMCarList';
import PackSimulator from './components/PackSimulator';
import RaceSimulator from './components/RaceSimulator';
import CDClicker from './components/CDClicker';
import HigherLower from './components/HigherLower';
// Internal testing pages - not linked in navigation
import TrialRaceFeasibility from './components/TrialRaceFeasibility';
import EventBuilder from './components/EventBuilder';

const theme = createTheme(themeOptions);

function App() {
	return (
		<BrowserRouter>
			<ThemeProvider theme={theme}>
				<Navbar />

				<div style={{ marginTop: '5rem' }} />

				<Routes>
					<Route
						exact
						path='/'
						element={<FrontPage />}
					/>
					<Route
						exact
						path='/home'
						element={<Home />}
					/>
					<Route
						exact
						path='/tune-calculator'
						element={<Creation />}
					/>
					<Route
						exact
						path='/tracks'
						element={<TrackList />}
					/>
					<Route
						exact
						path='/packs'
						element={<PackList />}
					/>
					<Route
						exact
						path='/bm-cars'
						element={<BMCarList />}
					/>
					<Route
						exact
						path='/pack-simulator'
						element={<PackSimulator />}
					/>
					<Route
						exact
						path='/race-simulator'
						element={<RaceSimulator />}
					/>
					<Route
						exact
						path='/clicker'
						element={<CDClicker />}
					/>
					<Route
						exact
						path='/higher-lower'
						element={<HigherLower />}
					/>
					{/* Internal testing pages - direct URL access only */}
					<Route
						exact
						path='/testingmode123'
						element={<TrialRaceFeasibility />}
					/>
					<Route
						exact
						path='/eventbuilder123'
						element={<EventBuilder />}
					/>
					{/* <Route exact path='/cloned-drives-react/foot' element={<Footer />} /> */}
					<Route
						exact
						path='*'
						element={<NoMatch />}
					/>
					{/* <Route element={<Footer />} /> */}
				</Routes>

				{/* <Footer /> */}
			</ThemeProvider>
		</BrowserRouter>
	);
}

export default App;
