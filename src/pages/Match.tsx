import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, X } from 'lucide-react';
import AppShell from '../components/AppShell';
import { splitTags } from '../lib/format';

interface Candidate {
	id: string;
	username: string;
	bio: string | null;
	course: string | null;
	interests: string | null;
	location: string | null;
	github_username: string | null;
}

function Match() {
	const navigate = useNavigate();
	const [candidates, setCandidates] = useState<Candidate[]>([]);
	const [index, setIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<'profile' | 'other' | null>(null);
	const [courseFilter, setCourseFilter] = useState('');
	const [appliedFilter, setAppliedFilter] = useState('');
	const [acting, setActing] = useState(false);
	const [actionFailed, setActionFailed] = useState(false);
	const [newMatch, setNewMatch] = useState<string | null>(null);

	const token = localStorage.getItem('token');

	const load = (course: string) => {
		setLoading(true);
		setIndex(0);
		const url = course
			? `/matches?course=${encodeURIComponent(course)}`
			: '/matches';
		axios
			.get(url, { headers: { Authorization: `Bearer ${token}` } })
			.then((res) => {
				setCandidates(res.data);
				setError(null);
			})
			.catch((err) => {
				if (err.response?.status === 401) {
					localStorage.removeItem('token');
					navigate('/login');
					return;
				}
				setError(err.response?.status === 400 ? 'profile' : 'other');
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		if (!token) {
			navigate('/login');
			return;
		}
		load('');
	}, []);

	const current = candidates[index];

	const handleAction = useCallback(
		async (action: 'like' | 'pass') => {
			if (!current || acting) return;
			setActing(true);
			setActionFailed(false);
			try {
				const res = await axios.post(
					'/matches/action',
					{ to_user_id: current.id, action },
					{ headers: { Authorization: `Bearer ${token}` } },
				);
				if (res.data.is_mutual) setNewMatch(current.username);
				setIndex((i) => i + 1);
			} catch {
				setActionFailed(true);
			} finally {
				setActing(false);
			}
		},
		[current, acting, token],
	);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement) return;
			if (e.key === 'ArrowLeft') handleAction('pass');
			if (e.key === 'ArrowRight') handleAction('like');
		};
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [handleAction]);

	const applyFilter = (e: React.FormEvent) => {
		e.preventDefault();
		const course = courseFilter.trim();
		setAppliedFilter(course);
		load(course);
	};

	const clearFilter = () => {
		setCourseFilter('');
		setAppliedFilter('');
		load('');
	};

	const tags = current ? splitTags(current.interests) : [];

	let body: ReactNode;
	if (loading) {
		body = <p className="muted text-sm">Loading…</p>;
	} else if (error === 'profile') {
		body = (
			<p className="text-sm">
				Add a course, interests or bio to{' '}
				<Link to="/profile">your profile</Link> first. Suggestions are based on
				them.
			</p>
		);
	} else if (error) {
		body = (
			<p className="text-sm">
				Couldn't load suggestions. Refresh to try again.
			</p>
		);
	} else if (!current) {
		body = (
			<div className="text-sm">
				<p>
					No one left to show
					{appliedFilter && <> for “{appliedFilter}”</>}.
				</p>
				{appliedFilter ? (
					<button onClick={clearFilter} className="btn-text mt-1 underline">
						Clear the filter
					</button>
				) : (
					<p className="muted mt-1">Check back once more people have joined.</p>
				)}
			</div>
		);
	} else {
		body = (
			<>
				<article className="card p-6 md:p-8">
					<h2 className="font-display text-3xl font-extrabold tracking-tight">
						{current.username}
					</h2>
					{(current.course || current.location) && (
						<p className="muted text-sm">
							{[current.course, current.location].filter(Boolean).join(' · ')}
						</p>
					)}
					{current.bio && <p className="mt-4 leading-relaxed">{current.bio}</p>}
					{tags.length > 0 && (
						<div className="mt-4 flex flex-wrap gap-1.5">
							{tags.map((tag) => (
								<span key={tag} className="chip">
									{tag}
								</span>
							))}
						</div>
					)}
					{current.github_username && (
						<p className="mt-4 text-sm">
							<a
								href={`https://github.com/${current.github_username}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								github.com/{current.github_username}
							</a>
						</p>
					)}
				</article>

				<div className="mt-4 flex gap-3">
					<button
						onClick={() => handleAction('pass')}
						disabled={acting}
						className="btn btn-secondary flex-1 py-2.5"
					>
						<X className="h-4 w-4" />
						Pass
					</button>
					<button
						onClick={() => handleAction('like')}
						disabled={acting}
						className="btn btn-primary flex-1 py-2.5"
					>
						<Heart className="h-4 w-4" />
						Like
					</button>
				</div>
				{actionFailed ? (
					<p className="mt-3 text-xs text-[var(--danger)]">
						That didn't save. Try again.
					</p>
				) : (
					<p className="muted mt-3 hidden text-xs sm:block">
						You can also use the ← and → keys.
					</p>
				)}
			</>
		);
	}

	return (
		<AppShell>
			<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
				<div className="flex items-baseline gap-4">
					<h1 className="font-display text-4xl font-extrabold tracking-tight">
						Discover
					</h1>
					{current && !loading && (
						<span className="muted text-sm">
							{index + 1} of {candidates.length}
						</span>
					)}
				</div>

				<form onSubmit={applyFilter} className="flex gap-2 md:w-[26rem]">
					<input
						placeholder="Filter by course"
						value={courseFilter}
						onChange={(e) => setCourseFilter(e.target.value)}
						className="input"
					/>
					<button type="submit" className="btn btn-ink shrink-0">
						Filter
					</button>
					{appliedFilter && (
						<button
							type="button"
							onClick={clearFilter}
							className="btn-text shrink-0 px-1"
						>
							Clear
						</button>
					)}
				</form>
			</div>

			{newMatch && (
				<p className="mx-auto mt-6 max-w-2xl border border-[var(--accent)]/30 bg-white px-4 py-3 text-sm">
					You and {newMatch} liked each other. Their contact details are on your{' '}
					<Link to="/matches">Matches</Link> page.
				</p>
			)}

			<div className="mx-auto mt-8 max-w-2xl">{body}</div>
		</AppShell>
	);
}

export default Match;
