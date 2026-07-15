import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface MutualMatch {
	id: string;
	username: string;
	bio: string;
	course: string;
	interests: string;
	location: string;
	contact: string;
}

function Matches() {
	const navigate = useNavigate();
	const [matches, setMatches] = useState<MutualMatch[]>([]);
	const [loading, setLoading] = useState(true);
	const [icebreakers, setIcebreakers] = useState<{ [key: string]: string }>(
		{},
	);
	const [loadingIcebreaker, setLoadingIcebreaker] = useState<{
		[key: string]: boolean;
	}>({});

	const token = localStorage.getItem('token');

	useEffect(() => {
		if (!token) {
			navigate('/login');
			return;
		}

		axios
			.get('http://localhost:8000/matches/mutual', {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((res) => {
				setMatches(res.data);
				setLoading(false);
			})
			.catch(() => {
				navigate('/login');
			});
	}, []);

	if (loading)
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<div className="text-gray-500">Loading...</div>
			</div>
		);

	const getIcebreaker = async (userId: string) => {
		setLoadingIcebreaker((prev) => ({ ...prev, [userId]: true }));
		const res = await axios.get(
			`http://localhost:8000/matches/mutual/${userId}/icebreaker`,
			{ headers: { Authorization: `Bearer ${token}` } },
		);
		setIcebreakers((prev) => ({ ...prev, [userId]: res.data.icebreaker }));
		setLoadingIcebreaker((prev) => ({ ...prev, [userId]: false }));
	};

	return (
		<div className="min-h-screen bg-black text-white">
			<div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
				<button
					onClick={() => navigate('/')}
					className="text-black-500 font-bold text-lg"
				>
					csoc
				</button>
				<span className="text-gray-500 text-sm">
					{matches.length}{' '}
					{matches.length === 1 ? 'match' : 'matches'}
				</span>
			</div>

			<div className="max-w-lg mx-auto px-6 py-8">
				<h1 className="text-3xl font-bold mb-8">Your Matches</h1>
				{matches.length === 0 && (
					<div className="flex flex-col items-center justify-center py-24 text-center">
						<div className="text-4xl mb-4">💚</div>
						<p className="text-gray-400 mb-4">
							No mutual matches yet.
						</p>
						<button
							onClick={() => navigate('/match')}
							className="text-green-500 hover:underline text-sm"
						>
							Find people →
						</button>
					</div>
				)}

				<div className="flex flex-col gap-4">
					{matches.map((match) => (
						<div
							key={match.id}
							className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
						>
							<h2 className="text-xl font-bold text-white mb-3">
								{match.username}
							</h2>

							<div className="flex flex-col gap-2 mb-4">
								{match.course && (
									<div className="flex gap-2 text-sm">
										<span className="text-gray-500">
											Studies
										</span>
										<span className="text-white">
											{match.course}
										</span>
									</div>
								)}
								{match.location && (
									<div className="flex gap-2 text-sm">
										<span className="text-gray-500">
											Based in
										</span>
										<span className="text-white">
											{match.location}
										</span>
									</div>
								)}
								{match.interests && (
									<div className="flex gap-2 text-sm">
										<span className="text-gray-500">
											Into
										</span>
										<span className="text-white">
											{match.interests}
										</span>
									</div>
								)}
								{match.bio && (
									<p className="text-gray-300 text-sm mt-1 leading-relaxed">
										{match.bio}
									</p>
								)}
								{match.contact && (
									<div className="flex gap-2 text-sm pt-3 mt-1 border-t border-gray-800">
										<span className="text-gray-500">
											Contact
										</span>
										<span className="text-green-400">
											{match.contact}
										</span>
									</div>
								)}
							</div>

							{icebreakers[match.id] ? (
								<div className="bg-black border border-gray-700 rounded-xl px-4 py-3 mt-2">
									<p className="text-gray-400 text-xs mb-1">
										Suggested opener
									</p>
									<p className="text-white text-sm italic">
										"{icebreakers[match.id]}"
									</p>
								</div>
							) : (
								<button
									onClick={() => getIcebreaker(match.id)}
									disabled={loadingIcebreaker[match.id]}
									className="w-full mt-2 border border-gray-700 hover:border-green-500 text-black-400 hover:text-white text-sm rounded-xl py-2 transition"
								>
									{loadingIcebreaker[match.id]
										? 'Generating...'
										: '✨ Get icebreaker'}
								</button>
							)}
						</div>
					))}
				</div>

				<button
					onClick={() => navigate('/')}
					className="mt-8 text-black-500 hover:text-white text-sm transition"
				>
					← Back to home
				</button>
			</div>
		</div>
	);
}

export default Matches;
