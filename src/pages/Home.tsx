import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppShell from '../components/AppShell';
import { subscribeToPush } from '../api/push';
import { formatEventTime, joinWords } from '../lib/format';

interface Me {
	username: string;
	course: string | null;
	bio: string | null;
	interests: string | null;
}

interface Person {
	id: string;
	username: string;
	course: string | null;
}

interface SuggestedEvent {
	id: string;
	title: string;
	starts_at: string;
	location: string | null;
}

function Home() {
	const navigate = useNavigate();
	const [me, setMe] = useState<Me | null>(null);
	const [mutual, setMutual] = useState<Person[]>([]);
	const [liked, setLiked] = useState<Person[]>([]);
	const [events, setEvents] = useState<SuggestedEvent[]>([]);

	const token = localStorage.getItem('token');

	useEffect(() => {
		if (!token) {
			navigate('/login');
			return;
		}
		const headers = { Authorization: `Bearer ${token}` };

		axios
			.get('/me', { headers })
			.then((res) => {
				setMe(res.data);
				subscribeToPush(token).catch(() => {});
			})
			.catch(() => {
				localStorage.removeItem('token');
				navigate('/login');
			});

		axios
			.get('/matches/mutual', { headers })
			.then((res) => setMutual(res.data))
			.catch(() => {});
		axios
			.get('/matches/liked', { headers })
			.then((res) => setLiked(res.data))
			.catch(() => {});
		axios
			.get('/events?limit=3', { headers })
			.then((res) => setEvents(res.data.events))
			.catch(() => {});
	}, []);

	if (!me) {
		return (
			<AppShell>
				<p className="muted text-sm">Loading…</p>
			</AppShell>
		);
	}

	const missing = [
		!me.course && 'course',
		!me.interests && 'interests',
		!me.bio && 'bio',
	].filter((field): field is string => Boolean(field));

	return (
		<AppShell>
			<h1 className="break-words font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
				Hello {me.username}.
			</h1>
			<p className="muted mt-2">{me.course || 'No course set'}</p>

			<div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
				<div className="min-w-0">
					<button
						onClick={() => navigate('/match')}
						className="relative w-full bg-[var(--text)] px-6 py-7 text-left text-white transition-colors hover:bg-[var(--accent)] md:px-8"
					>
						<span className="block font-display text-2xl font-bold tracking-tight">
							Find people
						</span>
						<span className="mt-1 block pr-10 text-sm text-white/65">
							Suggested students, one at a time. Like each other and you can see
							each other's contact details.
						</span>
						<span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl md:right-8">
							→
						</span>
					</button>

					<section className="mt-12">
						<div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-3">
							<h2 className="font-display text-lg font-bold">
								Suggested events
							</h2>
							<Link to="/events" className="text-sm">
								All events
							</Link>
						</div>
						{events.length === 0 ? (
							<p className="muted mt-3 text-sm">
								Nothing posted yet. <Link to="/events">Post an event</Link>.
							</p>
						) : (
							<ul className="divide-y divide-[var(--border)]">
								{events.map((event) => (
									<li
										key={event.id}
										className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-6"
									>
										<span className="text-sm text-[var(--accent)] sm:w-40 sm:shrink-0">
											{formatEventTime(event.starts_at)}
										</span>
										<span className="min-w-0">
											<span className="block font-medium">{event.title}</span>
											{event.location && (
												<span className="muted block text-sm">
													{event.location}
												</span>
											)}
										</span>
									</li>
								))}
							</ul>
						)}
					</section>
				</div>

				<aside className="flex flex-col gap-8">
					<section>
						<div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-3">
							<h2 className="font-display text-lg font-bold">Matches</h2>
							<Link to="/matches" className="text-sm">
								View all
							</Link>
						</div>
						{mutual.length === 0 ? (
							<p className="muted mt-3 text-sm">No mutual matches yet.</p>
						) : (
							<ul className="divide-y divide-[var(--border)] text-sm">
								{mutual.slice(0, 5).map((person) => (
									<li key={person.id} className="py-3">
										<span className="block font-medium">{person.username}</span>
										{person.course && (
											<span className="muted block truncate">
												{person.course}
											</span>
										)}
									</li>
								))}
							</ul>
						)}
						{liked.length > 0 && (
							<p className="muted mt-3 text-sm">
								{liked.length === 1
									? '1 person you liked hasn’t liked you back yet.'
									: `${liked.length} people you liked haven’t liked you back yet.`}
							</p>
						)}
					</section>

					{missing.length > 0 && (
						<p className="border border-[var(--border)] bg-white px-4 py-3 text-sm">
							Your profile is missing your {joinWords(missing)}. Suggestions are
							based on these, so <Link to="/profile">fill them in</Link> before
							browsing.
						</p>
					)}
				</aside>
			</div>
		</AppShell>
	);
}

export default Home;
