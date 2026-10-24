import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppShell from '../components/AppShell';
import { formatEventTime } from '../lib/format';

interface UserResult {
	id: string;
	username: string;
	course: string;
	interests: string;
	location: string;
}

interface EventResult {
	id: string;
	title: string;
	location: string;
	starts_at: string;
	organizer: string;
}

function Search() {
	const navigate = useNavigate();
	const [query, setQuery] = useState('');
	const [users, setUsers] = useState<UserResult[]>([]);
	const [events, setEvents] = useState<EventResult[]>([]);
	const [lastQuery, setLastQuery] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const token = localStorage.getItem('token');

	useEffect(() => {
		if (!token) {
			navigate('/login');
		}
	}, []);

	const handleSearch = async (e: React.FormEvent) => {
		e.preventDefault();
		const q = query.trim();
		if (!q) return;
		setLoading(true);
		try {
			const res = await axios.get(`/search?q=${encodeURIComponent(q)}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setUsers(res.data.users);
			setEvents(res.data.events);
			setLastQuery(q);
		} catch (err) {
			if (axios.isAxiosError(err) && err.response?.status === 401) {
				localStorage.removeItem('token');
				navigate('/login');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<AppShell>
			<h1 className="font-display text-4xl font-extrabold tracking-tight">
				Search
			</h1>

			<form onSubmit={handleSearch} className="mt-6 flex max-w-2xl gap-2">
				<input
					type="search"
					placeholder="Name, course, interest or event"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					autoFocus
					className="input"
				/>
				<button
					type="submit"
					disabled={loading}
					className="btn btn-secondary shrink-0"
				>
					{loading ? 'Searching…' : 'Search'}
				</button>
			</form>

			{lastQuery !== null && (
				<div className="mt-8 grid gap-8 md:grid-cols-2">
					<section>
						<h2 className="font-display text-lg font-bold">
							People <span className="muted font-normal">({users.length})</span>
						</h2>
						{users.length === 0 ? (
							<p className="muted mt-2 text-sm">
								No one matches “{lastQuery}”.
							</p>
						) : (
							<ul className="mt-2 divide-y divide-[var(--border)]">
								{users.map((u) => (
									<li key={u.id} className="py-3 text-sm">
										<p className="font-medium">{u.username}</p>
										{(u.course || u.location) && (
											<p className="muted">
												{[u.course, u.location].filter(Boolean).join(' · ')}
											</p>
										)}
										{u.interests && <p className="muted">{u.interests}</p>}
									</li>
								))}
							</ul>
						)}
					</section>

					<section>
						<h2 className="font-display text-lg font-bold">
							Events{' '}
							<span className="muted font-normal">({events.length})</span>
						</h2>
						{events.length === 0 ? (
							<p className="muted mt-2 text-sm">
								No events match “{lastQuery}”.
							</p>
						) : (
							<ul className="mt-2 divide-y divide-[var(--border)]">
								{events.map((e) => (
									<li key={e.id} className="py-3 text-sm">
										<p className="font-medium">{e.title}</p>
										<p className="muted">
											{[formatEventTime(e.starts_at), e.location]
												.filter(Boolean)
												.join(' · ')}
										</p>
										<p className="muted">Posted by {e.organizer}</p>
									</li>
								))}
							</ul>
						)}
					</section>
				</div>
			)}
		</AppShell>
	);
}

export default Search;
