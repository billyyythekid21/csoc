import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import Home from './pages/Home.tsx';
import Profile from './pages/Profile.tsx';
import Match from './pages/Match.tsx';
import Events from './pages/Events.tsx';
import Matches from './pages/Matches.tsx';
import Search from './pages/Search.tsx';

function App() {
	return (
		<Routes>
			<Route
				path="/"
				element={<Home />}
			/>
			<Route
				path="/login"
				element={<Login />}
			/>
			<Route
				path="/signup"
				element={<Signup />}
			/>
			<Route
				path="/profile"
				element={<Profile />}
			/>
			<Route
				path="/match"
				element={<Match />}
			/>
			<Route
				path="/matches"
				element={<Matches />}
			/>
			<Route
				path="/events"
				element={<Events />}
			/>
			<Route
				path="/search"
				element={<Search />}
			/>
		</Routes>
	);
}

export default App;
