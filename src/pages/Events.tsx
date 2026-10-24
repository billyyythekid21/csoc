import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppShell from '../components/AppShell';
import { formatEventTime, splitTags } from '../lib/format';

interface CampusEvent {
	id: string;
	title: string;
	description: string;
	location: string;
	starts_at: string;
	tags: string;
	organizer: string;
	rsvp_count?: number;
	user_rsvpd?: boolean;
}

const emptyForm = {
	title: '',
	description: '',
	location: '',
	starts_at: '',
	tags: '',
};

type EventForm = typeof emptyForm;

function EventFields({
	idPrefix,
	form,
	onChange,
}: {
	idPrefix: string;
	form: EventForm;
	onChange: (form: EventForm) => void;
}) {
	const bind = (key: keyof EventForm) => ({
		id: `${idPrefix}-${key}`,
		value: form[key],
		onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
			onChange({ ...form, [key]: e.target.value }),
	});

	return (
		<div className="grid gap-4 sm:grid-cols-2">
			<div className="sm:col-span-2">
				<label htmlFor={`${idPrefix}-title`} className="label">
					Title
				</label>
				<input {...bind('title')} required className="input" />
			</div>
			<div>
				<label htmlFor={`${idPrefix}-starts_at`} className="label">
					When
				</label>
				<input
					{...bind('starts_at')}
					type="datetime-local"
					required
					className="input"
				/>
			</div>
			<div>
				<label htmlFor={`${idPrefix}-location`} className="label">
					Where
				</label>
				<input
					{...bind('location')}
					placeholder="e.g. Woodside Building, room 2.01"
					className="input"
				/>
			</div>
			<div className="sm:col-span-2">
				<label htmlFor={`${idPrefix}-description`} className="label">
					Description
				</label>
				<textarea
					{...bind('description')}
					rows={4}
					className="input resize-y"
				/>
			</div>
			<div className="sm:col-span-2">
				<label htmlFor={`${idPrefix}-tags`} className="label">
					Tags
				</label>
				<input
					{...bind('tags')}
					placeholder="study, social, hackathon"
					className="input"
				/>
				<p className="hint">Comma separated.</p>
			</div>
		</div>
	);
}

function Events() {
	const navigate = useNavigate();
	const [events, setEvents] = useState<CampusEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [page, setPage] = useState(0);
	const [total, setTotal] = useState(0);
	const limit = 10;
	const [form, setForm] = useState(emptyForm);
	const [editingEventId, setEditingEventId] = useState<string | null>(null);
	const [editForm, setEditForm] = useState(emptyForm);
	const [myUsername, setMyUsername] = useState<string>('');

	const token = localStorage.getItem('token');

	const fetchEvents = async () => {
		try {
			const meRes = await axios.get('/me', {
				headers: { Authorization: `Bearer ${token}` },
			});
			const currentUsername = meRes.data.username;
			setMyUsername(currentUsername);

			const res = await axios.get(
				`/events?skip=${page * limit}&limit=${limit}`,
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			setTotal(res.data.total);

			const eventsWithRsvp = await Promise.all(
				res.data.events.map(async (event: CampusEvent) => {
					const rsvpRes = await axios.get(`/events/${event.id}/rsvps`, {
						headers: { Authorization: `Bearer ${token}` },
					});
					const rsvps = rsvpRes.data;
					return {
						...event,
						rsvp_count: rsvps.length,
						user_rsvpd: rsvps.some(
							(r: { username: string }) => r.username === currentUsername,
						),
					};
				}),
			);

			setEvents(eventsWithRsvp);
		} catch {
			if (!token) navigate('/login');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!token) {
			navigate('/login');
			return;
		}
		fetchEvents();
	}, [page]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await axios.post('/events', form, {
			headers: { Authorization: `Bearer ${token}` },
		});
		setForm(emptyForm);
		setShowForm(false);
		fetchEvents();
	};

	const handleRsvp = async (event: CampusEvent) => {
		if (event.user_rsvpd) {
			await axios.delete(`/events/${event.id}/rsvp`, {
				headers: { Authorization: `Bearer ${token}` },
			});
		} else {
			await axios.post(
				`/events/${event.id}/rsvp`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } },
			);
		}
		fetchEvents();
	};

	const handleDelete = async (eventId: string) => {
		if (!confirm('Delete this event?')) return;
		await axios.delete(`/events/${eventId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		fetchEvents();
	};

	const handleEdit = async (e: React.FormEvent, eventId: string) => {
		e.preventDefault();
		await axios.patch(`/events/${eventId}`, editForm, {
			headers: { Authorization: `Bearer ${token}` },
		});
		setEditingEventId(null);
		fetchEvents();
	};

	const startEditing = (event: CampusEvent) => {
		setEditingEventId(event.id);
		setEditForm({
			title: event.title,
			description: event.description,
			location: event.location || '',
			starts_at: event.starts_at.slice(0, 16),
			tags: event.tags || '',
		});
	};

	const pageCount = Math.max(1, Math.ceil(total / limit));

	return (
		<AppShell>
			<div className="flex items-center justify-between gap-4">
				<h1 className="font-display text-4xl font-extrabold tracking-tight">
					Events
				</h1>
				{!showForm && (
					<button onClick={() => setShowForm(true)} className="btn btn-primary">
						New event
					</button>
				)}
			</div>

			{showForm && (
				<form onSubmit={handleSubmit} className="card mt-6 max-w-3xl p-6">
					<h2 className="mb-4 font-display text-lg font-bold">New event</h2>
					<EventFields idPrefix="new" form={form} onChange={setForm} />
					<div className="mt-5 flex gap-3">
						<button type="submit" className="btn btn-primary">
							Post event
						</button>
						<button
							type="button"
							onClick={() => {
								setShowForm(false);
								setForm(emptyForm);
							}}
							className="btn btn-secondary"
						>
							Cancel
						</button>
					</div>
				</form>
			)}

			{loading && <p className="muted mt-6 text-sm">Loading…</p>}

			{!loading && events.length === 0 && (
				<p className="muted mt-6 text-sm">
					No events yet. Anything you post shows up here for everyone.
				</p>
			)}

			{!loading && events.length > 0 && (
				<ul className="mt-6 grid gap-6 md:grid-cols-2">
					{events.map((event) => (
						<li
							key={event.id}
							className={`card flex flex-col p-6 ${
								editingEventId === event.id ? 'md:col-span-2' : ''
							}`}
						>
							{editingEventId === event.id ? (
								<form onSubmit={(e) => handleEdit(e, event.id)}>
									<EventFields
										idPrefix={event.id}
										form={editForm}
										onChange={setEditForm}
									/>
									<div className="mt-4 flex gap-3">
										<button type="submit" className="btn btn-primary">
											Save
										</button>
										<button
											type="button"
											onClick={() => setEditingEventId(null)}
											className="btn btn-secondary"
										>
											Cancel
										</button>
									</div>
								</form>
							) : (
								<>
									<div className="flex items-start justify-between gap-4">
										<div className="min-w-0">
											<p className="text-sm text-[var(--accent)]">
												{formatEventTime(event.starts_at)}
											</p>
											<h2 className="mt-0.5 font-display text-xl font-bold tracking-tight">
												{event.title}
											</h2>
											<p className="muted text-sm">
												{[event.location, `posted by ${event.organizer}`]
													.filter(Boolean)
													.join(' · ')}
											</p>
										</div>
										<button
											onClick={() => handleRsvp(event)}
											title={
												event.user_rsvpd
													? 'Click to cancel your RSVP'
													: undefined
											}
											className={`btn shrink-0 ${
												event.user_rsvpd ? 'btn-primary' : 'btn-secondary'
											}`}
										>
											{event.user_rsvpd ? 'Going' : 'RSVP'}
										</button>
									</div>

									{event.description && (
										<p className="mt-3 whitespace-pre-line text-sm leading-relaxed">
											{event.description}
										</p>
									)}

									<div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-sm">
										<span className="muted">{event.rsvp_count} going</span>
										{splitTags(event.tags).length > 0 && (
											<span className="flex flex-wrap gap-1.5">
												{splitTags(event.tags).map((tag) => (
													<span key={tag} className="chip">
														{tag}
													</span>
												))}
											</span>
										)}
										{event.organizer === myUsername && (
											<span className="ml-auto flex gap-4">
												<button
													onClick={() => startEditing(event)}
													className="btn-text"
												>
													Edit
												</button>
												<button
													onClick={() => handleDelete(event.id)}
													className="btn-text hover:text-[var(--danger)]"
												>
													Delete
												</button>
											</span>
										)}
									</div>
								</>
							)}
						</li>
					))}
				</ul>
			)}

			{total > limit && (
				<div className="mt-6 flex items-center gap-3 text-sm">
					<button
						onClick={() => setPage((p) => p - 1)}
						disabled={page === 0}
						className="btn btn-secondary"
					>
						Previous
					</button>
					<span className="muted">
						Page {page + 1} of {pageCount}
					</span>
					<button
						onClick={() => setPage((p) => p + 1)}
						disabled={page + 1 >= pageCount}
						className="btn btn-secondary"
					>
						Next
					</button>
				</div>
			)}
		</AppShell>
	);
}

export default Events;
