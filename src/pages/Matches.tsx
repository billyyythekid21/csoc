import { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppShell from '../components/AppShell';
import { displayUrl, isWebUrl, splitTags } from '../lib/format';

interface MutualMatch {
	id: string;
	username: string;
	bio: string | null;
	course: string | null;
	interests: string | null;
	location: string | null;
	contact: string | null;
	github_username: string | null;
	instagram: string | null;
	facebook: string | null;
	website: string | null;
	contact_email: string | null;
	discord: string | null;
}

interface LikedUser {
	id: string;
	username: string;
	bio: string | null;
	course: string | null;
	interests: string | null;
	location: string | null;
}

interface ContactRow {
	label: string;
	value: string;
	href?: string;
}

function linkRow(label: string, value: string | null): ContactRow[] {
	if (!value) return [];
	return isWebUrl(value)
		? [{ label, value: displayUrl(value), href: value }]
		: [{ label, value }];
}

function contactRows(match: MutualMatch): ContactRow[] {
	return [
		...(match.contact ? [{ label: 'Contact', value: match.contact }] : []),
		...(match.discord ? [{ label: 'Discord', value: match.discord }] : []),
		...(match.contact_email
			? [
					{
						label: 'Email',
						value: match.contact_email,
						href: `mailto:${match.contact_email}`,
					},
				]
			: []),
		...(match.github_username
			? [
					{
						label: 'GitHub',
						value: match.github_username,
						href: `https://github.com/${match.github_username}`,
					},
				]
			: []),
		...linkRow('Instagram', match.instagram),
		...linkRow('Facebook', match.facebook),
		...linkRow('Website', match.website),
	];
}

function subtitle(person: { course: string | null; location: string | null }) {
	return [person.course, person.location].filter(Boolean).join(' · ');
}

function Matches() {
	const navigate = useNavigate();
	const [tab, setTab] = useState<'mutual' | 'liked'>('mutual');
	const [matches, setMatches] = useState<MutualMatch[]>([]);
	const [liked, setLiked] = useState<LikedUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [openers, setOpeners] = useState<Record<string, string>>({});
	const [openerLoading, setOpenerLoading] = useState<Record<string, boolean>>(
		{},
	);
	const [openerFailed, setOpenerFailed] = useState<Record<string, boolean>>({});
	const [copied, setCopied] = useState<string | null>(null);

	const token = localStorage.getItem('token');

	useEffect(() => {
		if (!token) {
			navigate('/login');
			return;
		}

		Promise.all([
			axios.get('/matches/mutual', {
				headers: { Authorization: `Bearer ${token}` },
			}),
			axios.get('/matches/liked', {
				headers: { Authorization: `Bearer ${token}` },
			}),
		])
			.then(([matchesRes, likedRes]) => {
				setMatches(matchesRes.data);
				setLiked(likedRes.data);
				setLoading(false);
			})
			.catch(() => {
				navigate('/login');
			});
	}, []);

	const getOpener = async (userId: string) => {
		setOpenerLoading((prev) => ({ ...prev, [userId]: true }));
		setOpenerFailed((prev) => ({ ...prev, [userId]: false }));
		try {
			const res = await axios.get(`/matches/mutual/${userId}/icebreaker`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setOpeners((prev) => ({ ...prev, [userId]: res.data.icebreaker.trim() }));
		} catch {
			setOpenerFailed((prev) => ({ ...prev, [userId]: true }));
		} finally {
			setOpenerLoading((prev) => ({ ...prev, [userId]: false }));
		}
	};

	const copyOpener = async (userId: string) => {
		await navigator.clipboard.writeText(openers[userId]);
		setCopied(userId);
		setTimeout(() => setCopied(null), 1500);
	};

	const handleUnlike = async (match: MutualMatch) => {
		if (
			!confirm(
				`Unlike ${match.username}? You'll stop seeing each other's contact details.`,
			)
		)
			return;
		await axios.delete(`/matches/action/${match.id}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		setMatches((prev) => prev.filter((m) => m.id !== match.id));
	};

	return (
		<AppShell>
			<h1 className="font-display text-4xl font-extrabold tracking-tight">
				Matches
			</h1>

			<div className="mt-4 flex gap-5 border-b border-[var(--border)] text-sm">
				{(
					[
						['mutual', `Mutual (${matches.length})`],
						['liked', `Liked (${liked.length})`],
					] as const
				).map(([key, label]) => (
					<button
						key={key}
						onClick={() => setTab(key)}
						className={`-mb-px border-b-2 pb-2 ${
							tab === key
								? 'border-[var(--text)] font-medium'
								: 'muted border-transparent hover:text-[var(--text)]'
						}`}
					>
						{label}
					</button>
				))}
			</div>

			{loading && <p className="muted mt-6 text-sm">Loading…</p>}

			{!loading && tab === 'mutual' && matches.length === 0 && (
				<p className="muted mt-6 text-sm">
					No mutual matches yet. When someone you liked likes you back, they
					show up here. <Link to="/match">Browse people</Link>
				</p>
			)}

			{!loading && tab === 'liked' && liked.length === 0 && (
				<p className="muted mt-6 text-sm">
					You haven't liked anyone yet. <Link to="/match">Browse people</Link>
				</p>
			)}

			{!loading && tab === 'mutual' && matches.length > 0 && (
				<ul className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
					{matches.map((match) => {
						const rows = contactRows(match);
						const tags = splitTags(match.interests);
						return (
							<li key={match.id} className="card flex flex-col p-6">
								<div className="flex items-baseline justify-between gap-4">
									<h2 className="font-display text-xl font-bold tracking-tight">
										{match.username}
									</h2>
									<button
										onClick={() => handleUnlike(match)}
										className="btn-text text-xs hover:text-[var(--danger)]"
									>
										Unlike
									</button>
								</div>
								{subtitle(match) && (
									<p className="muted text-sm">{subtitle(match)}</p>
								)}
								{match.bio && (
									<p className="mt-2 text-sm leading-relaxed">{match.bio}</p>
								)}
								{tags.length > 0 && (
									<div className="mt-3 flex flex-wrap gap-1.5">
										{tags.map((tag) => (
											<span key={tag} className="chip">
												{tag}
											</span>
										))}
									</div>
								)}

								{rows.length > 0 && (
									<dl className="mt-4 grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1 text-sm">
										{rows.map((row) => (
											<Fragment key={row.label}>
												<dt className="muted">{row.label}</dt>
												<dd className="min-w-0 truncate">
													{row.href ? (
														<a
															href={row.href}
															target={isWebUrl(row.href) ? '_blank' : undefined}
															rel="noopener noreferrer"
														>
															{row.value}
														</a>
													) : (
														row.value
													)}
												</dd>
											</Fragment>
										))}
									</dl>
								)}

								<div className="mt-auto pt-5">
									{openers[match.id] ? (
										<div className="border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
											<p>{openers[match.id]}</p>
											<div className="mt-2 flex gap-4">
												<button
													onClick={() => copyOpener(match.id)}
													className="btn-text text-xs"
												>
													{copied === match.id ? 'Copied' : 'Copy'}
												</button>
												<button
													onClick={() => getOpener(match.id)}
													disabled={openerLoading[match.id]}
													className="btn-text text-xs"
												>
													{openerLoading[match.id] ? 'Writing…' : 'Try another'}
												</button>
											</div>
										</div>
									) : (
										<button
											onClick={() => getOpener(match.id)}
											disabled={openerLoading[match.id]}
											className="btn btn-secondary"
										>
											{openerLoading[match.id]
												? 'Writing…'
												: 'Suggest an opener'}
										</button>
									)}
									{openerFailed[match.id] && (
										<p className="mt-2 text-xs text-[var(--danger)]">
											Couldn't get a suggestion right now.
										</p>
									)}
								</div>
							</li>
						);
					})}
				</ul>
			)}

			{!loading && tab === 'liked' && liked.length > 0 && (
				<ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{liked.map((user) => (
						<li key={user.id} className="card p-6">
							<div className="flex items-baseline justify-between gap-4">
								<h2 className="font-display text-xl font-bold tracking-tight">
									{user.username}
								</h2>
								<span className="muted text-xs">No reply yet</span>
							</div>
							{subtitle(user) && (
								<p className="muted text-sm">{subtitle(user)}</p>
							)}
							{user.bio && (
								<p className="mt-2 text-sm leading-relaxed">{user.bio}</p>
							)}
						</li>
					))}
				</ul>
			)}
		</AppShell>
	);
}

export default Matches;
