import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface MatchUser {
	id: string;
	username: string;
	bio: string;
	course: string;
	interests: string;
	location: string;
	contact: string;
}

function Match() {
	const navigate = useNavigate();
	const [matches, setMatches] = useState<MatchUser[]>([]);
	const [index, setIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [courseFilter, setCourseFilter] = useState('');
	const [appliedFilter, setAppliedFilter] = useState('');

	const token = localStorage.getItem('token');

	useEffect(() => {
		if (!token) {
			navigate('/login');
			return;
		}

		axios
			.get('http://localhost:8000/matches', {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((res) => {
				setMatches(res.data);
				setLoading(false);
			})
			.catch((err) => {
				if (err.response?.status === 400) {
					setError('Complete your profile first');
				} else {
					setError('Something went wrong');
				}
				setLoading(false);
			});
	}, []);

	const applyFilter = () => {
		setAppliedFilter(courseFilter);
		setIndex(0);
		setLoading(true);
		const url = courseFilter
			? `http://localhost:8000/matches?course=${encodeURIComponent(courseFilter)}`
			: 'http://localhost:8000/matches';
		axios
			.get(url, {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((res) => {
				setMatches(res.data);
				setLoading(false);
			});
	};

	const clearFilter = () => {
		setCourseFilter('');
		setAppliedFilter('');
		setIndex(0);
		setLoading(true);
		axios
			.get('http://localhost:8000/matches', {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((res) => {
				setMatches(res.data);
				setLoading(false);
			});
	};

	const handleAction = async (action: 'like' | 'pass') => {
		const user = matches[index];
		const res = await axios.post(
			'http://localhost:8000/matches/action',
			{
				to_user_id: user.id,
				action,
			},
			{
				headers: { Authorization: `Bearer ${token}` },
			},
		);

		if (res.data.is_mutual) {
			alert(`You and ${user.username} both liked each other!`);
		}

		setIndex((i) => i + 1);
	};

	if (loading)
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<div className="text-gray-500">Loading...</div>
			</div>
		);

	if (error)
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<div className="text-center">
					<p className="text-gray-400 mb-4">{error}</p>
					<button
						onClick={() => navigate('/profile')}
						className="text-black-500 hover:underline text-sm"
					>
						Go to Profile
					</button>
				</div>
			</div>
		);

	if (matches.length === 0 || index >= matches.length)
		return (
			<div className="min-h-screen bg-black text-white">
				<div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
					<button
						onClick={() => navigate('/')}
						className="text-black-500 font-bold text-lg"
					>
						csoc
					</button>
				</div>
				<div className="flex flex-col items-center justify-center h-[80vh] text-center px-6">
					<div className="text-4xl mb-4">🌿</div>
					<h2 className="text-white text-xl font-semibold mb-2">
						You're all caught up!
					</h2>
					<p className="text-gray-500 mb-6">
						No more people to meet right now. Check back later.
					</p>
					<button
						onClick={() => navigate('/')}
						className="text-black-500 hover:underline text-sm"
					>
						← Back to home
					</button>
				</div>
			</div>
		);

	const user = matches[index];

	return (
		<div className="min-h-screen bg-black text-white">
			<div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
				<button
					onClick={() => navigate('/')}
					className="text-green-500 font-bold text-lg"
				>
					csoc
				</button>
				<span className="text-gray-500 text-sm">
					{index + 1} of {matches.length}
				</span>
			</div>

			<div className="max-w-lg mx-auto px-6 py-8">
				<div className="flex gap-2 mb-8">
					<input
						placeholder="Filter by course..."
						value={courseFilter}
						onChange={(e) => setCourseFilter(e.target.value)}
						className="flex-1 bg-gray-900 border border-gray-800 text-white placeholder-gray-600 rounded-lg px-4 py-2 text-sm outline-none focus:border-green-500 transition"
					/>
					<button
						onClick={applyFilter}
						className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg transition"
					>
						Apply
					</button>
					{appliedFilter && (
						<button
							onClick={clearFilter}
							className="text-gray-500 hover:text-white text-sm px-3 py-2 transition"
						>
							Clear
						</button>
					)}
				</div>

				<div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
					<h2 className="text-2xl font-bold text-white mb-4">
						{user.username}
					</h2>

					<div className="flex flex-col gap-2">
						{user.course && (
							<div className="flex gap-2 text-sm">
								<span className="text-gray-500">Studies</span>
								<span className="text-white">
									{user.course}
								</span>
							</div>
						)}
						{user.location && (
							<div className="flex gap-2 text-sm">
								<span className="text-gray-500">Based in</span>
								<span className="text-white">
									{user.location}
								</span>
							</div>
						)}
						{user.interests && (
							<div className="flex gap-2 text-sm">
								<span className="text-gray-500">Into</span>
								<span className="text-white">
									{user.interests}
								</span>
							</div>
						)}
						{user.bio && (
							<p className="text-gray-300 text-sm mt-2 leading-relaxed">
								{user.bio}
							</p>
						)}
						{user.contact && (
							<div className="flex gap-2 text-sm mt-2 pt-3 border-t border-gray-800">
								<span className="text-gray-500">Contact</span>
								<span className="text-green-400">
									{user.contact}
								</span>
							</div>
						)}
					</div>
				</div>

				<div className="flex gap-3">
					<button
						onClick={() => handleAction('pass')}
						className="flex-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white font-semibold rounded-xl py-4 transition"
					>
						Pass
					</button>
					<button
						onClick={() => handleAction('like')}
						className="flex-1 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl py-4 transition"
					>
						Like
					</button>
				</div>
			</div>
		</div>
	);
}

export default Match;
