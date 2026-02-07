import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { themeOptions } from './Theme';

// Auth imports
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AdminRoute from './components/AdminRoute';
import EventBuilder from './components/EventBuilder';
import TestingMode from './components/TrialRaceFeasibility';

// Profile imports
import Profile from './components/Profile';
import Settings from './components/Settings';

// Existing imports
import Navbar from './components/Navbar.jsx';
import Home from './components/Home.jsx';
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

const theme = createTheme(themeOptions);

function App() {
	return (
		<BrowserRouter>
			<ThemeProvider theme={theme}>
				<AuthProvider>
					<Navbar />

					<div style={{ marginTop: '5rem' }} />

					<Routes>
						{/* Public routes */}
						<Route
							exact
							path='/'
							element={<FrontPage />}
						/>
						<Route
							exact
							path='/login'
							element={<Login />}
						/>
						<Route
							exact
							path='/register'
							element={<Register />}
						/>
						<Route
							exact
							path='/forgot-password'
							element={<ForgotPassword />}
						/>
						<Route
							exact
							path='/reset-password'
							element={<ResetPassword />}
						/>
						
						{/* Profile routes */}
						<Route
							exact
							path='/profile'
							element={
								<ProtectedRoute>
									<Profile />
								</ProtectedRoute>
							}
						/>
						<Route
							exact
							path='/profile/:username'
							element={<Profile />}
						/>
						<Route
							exact
							path='/settings'
							element={
								<ProtectedRoute>
									<Settings />
								</ProtectedRoute>
							}
						/>
						
						{/* Public content routes (no auth required) */}
						<Route
							exact
							path='/home'
							element={<Home />}
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
						
						{/* Protected routes (require authentication) */}
						<Route
							exact
							path='/pack-simulator'
							element={
								<ProtectedRoute>
									<PackSimulator />
								</ProtectedRoute>
							}
						/>
						<Route
							exact
							path='/race-simulator'
							element={
								<ProtectedRoute>
									<RaceSimulator />
								</ProtectedRoute>
							}
						/>
						<Route
							exact
							path='/clicker'
							element={
								<ProtectedRoute>
									<CDClicker />
								</ProtectedRoute>
							}
						/>
						<Route
							exact
							path='/higher-lower'
							element={
								<ProtectedRoute>
									<HigherLower />
								</ProtectedRoute>
							}
						/>
						{/* Admin routes */}
<Route
    exact
    path='/eventbuilder123'
    element={
        <AdminRoute>
            <EventBuilder />
        </AdminRoute>
    }
/>
<Route
    exact
    path='/Testingmode123'
    element={
        <AdminRoute>
<TestingMode />
        </AdminRoute>
    }
/>
						{/* 404 catch-all */}
						<Route
							exact
							path='*'
							element={<NoMatch />}
						/>
					</Routes>

					<Footer />
				</AuthProvider>
			</ThemeProvider>
		</BrowserRouter>
	);
}

export default App;
