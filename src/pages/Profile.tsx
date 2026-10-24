import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AppShell from '../components/AppShell';

const emptyForm = {
	bio: '',
	location: '',
	course: '',
	contact: '',
	interests: '',
	github_username: '',
	instagram: '',
	facebook: '',
	website: '',
	contact_email: '',
	discord: '',
};

type ProfileForm = typeof emptyForm;

interface UserProfile extends ProfileForm {
	username: string;
	email: string;
}

interface FieldDef {
	name: keyof ProfileForm;
	label: string;
	placeholder?: string;
	type?: string;
	hint?: string;
	wide?: boolean;
}

const aboutFields: FieldDef[] = [
	{
		name: 'course',
		label: 'Course',
		placeholder: 'e.g. Bachelor of Computer Science',
	},
	{ name: 'location', label: 'Location', placeholder: 'e.g. Clayton' },
	{
		name: 'interests',
		label: 'Interests',
		placeholder: 'e.g. rock climbing, rust, machine learning',
		hint: 'Comma separated. Used to suggest people and events.',
		wide: true,
	},
];

const linkFields: FieldDef[] = [
	{
		name: 'contact',
		label: 'Preferred contact',
		placeholder: 'e.g. message me on Discord',
	},
	{ name: 'discord', label: 'Discord' },
	{ name: 'contact_email', label: 'Email', type: 'email' },
	{
		name: 'github_username',
		label: 'GitHub username',
		hint: 'Your public repos are factored into suggestions.',
	},
	{
		name: 'instagram',
		label: 'Instagram',
		placeholder: 'https://instagram.com/…',
	},
	{
		name: 'facebook',
		label: 'Facebook',
		placeholder: 'https://facebook.com/…',
	},
	{ name: 'website', label: 'Website', placeholder: 'https://…' },
];

function Profile() {
	const navigate = useNavigate();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [form, setForm] = useState<ProfileForm>(emptyForm);
	const [saving, setSaving] = useState(false);
	const [saveStatus, setSaveStatus] = useState<'saved' | 'failed' | null>(null);
	const [timetableStatus, setTimetableStatus] = useState<{
		ok: boolean;
		text: string;
	} | null>(null);

	const token = localStorage.getItem('token');

	useEffect(() => {
		if (!token) {
			navigate('/login');
			return;
		}

		axios
			.get('/me', {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((res) => {
				setProfile(res.data);
				setForm(
					Object.fromEntries(
						Object.keys(emptyForm).map((key) => [key, res.data[key] || '']),
					) as ProfileForm,
				);
			})
			.catch(() => {
				localStorage.removeItem('token');
				navigate('/login');
			});
	}, []);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setForm({ ...form, [e.target.name]: e.target.value });
		setSaveStatus(null);
	};

	const deleteAccount = async () => {
		if (
			!confirm(
				'Are you sure you want to delete your account? This cannot be undone.',
			)
		)
			return;
		await axios.delete('/me', {
			headers: { Authorization: `Bearer ${token}` },
		});
		localStorage.removeItem('token');
		navigate('/signup');
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			await axios.patch('/me', form, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setSaveStatus('saved');
		} catch {
			setSaveStatus('failed');
		} finally {
			setSaving(false);
		}
	};

	const handleTimetableUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('file', file);

		try {
			const res = await axios.post('/me/timetable', formData, {
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'multipart/form-data',
				},
			});
			setTimetableStatus({
				ok: true,
				text: `Imported ${res.data.slots_saved} free slots.`,
			});
		} catch {
			setTimetableStatus({
				ok: false,
				text: "Couldn't read that file. It needs to be an .ics calendar export.",
			});
		}
	};

	const renderField = (field: FieldDef) => (
		<div key={field.name} className={field.wide ? 'sm:col-span-2' : undefined}>
			<label htmlFor={field.name} className="label">
				{field.label}
			</label>
			<input
				id={field.name}
				name={field.name}
				type={field.type ?? 'text'}
				placeholder={field.placeholder}
				value={form[field.name]}
				onChange={handleChange}
				className="input"
			/>
			{field.hint && <p className="hint">{field.hint}</p>}
		</div>
	);

	if (!profile)
		return (
			<AppShell>
				<p className="muted text-sm">Loading…</p>
			</AppShell>
		);

	return (
		<AppShell>
			<h1 className="font-display text-4xl font-extrabold tracking-tight">
				Profile
			</h1>
			<p className="muted mt-1 text-sm">
				{profile.username} · {profile.email}
			</p>

			<div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
				<form onSubmit={handleSubmit}>
					<section>
						<h2 className="font-display text-lg font-bold">About you</h2>
						<div className="mt-4 grid gap-4 sm:grid-cols-2">
							{aboutFields.map(renderField)}
							<div className="sm:col-span-2">
								<label htmlFor="bio" className="label">
									Bio
								</label>
								<textarea
									id="bio"
									name="bio"
									placeholder="A couple of sentences about what you're studying or looking for."
									value={form.bio}
									onChange={handleChange}
									rows={4}
									className="input resize-y"
								/>
							</div>
						</div>
					</section>

					<section className="mt-8 border-t border-[var(--border)] pt-6">
						<h2 className="font-display text-lg font-bold">
							Contact and links
						</h2>
						<p className="muted mt-1 text-sm">
							Only people you've matched with see these. Your GitHub username
							also shows on your card in Discover.
						</p>
						<div className="mt-4 grid gap-4 sm:grid-cols-2">
							{linkFields.map(renderField)}
						</div>
					</section>

					<div className="mt-6 flex items-center gap-3">
						<button type="submit" disabled={saving} className="btn btn-primary">
							{saving ? 'Saving…' : 'Save changes'}
						</button>
						{saveStatus === 'saved' && (
							<span className="muted text-sm">Saved</span>
						)}
						{saveStatus === 'failed' && (
							<span className="text-sm text-[var(--danger)]">
								Couldn't save. Try again.
							</span>
						)}
					</div>
				</form>

				<aside className="flex flex-col gap-10">
					<section className="border-t border-[var(--border)] pt-6 lg:border-t-0 lg:pt-0">
						<h2 className="font-display text-lg font-bold">Timetable</h2>
						<p className="muted mt-1 text-sm">
							Import your timetable as an .ics file to record when you're free.
						</p>
						<input
							type="file"
							accept=".ics,text/calendar"
							onChange={handleTimetableUpload}
							className="mt-3 block text-sm file:mr-3 file:cursor-pointer file:border file:border-[var(--border)] file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold hover:file:border-[var(--text)]"
						/>
						{timetableStatus && (
							<p
								className={`mt-2 text-sm ${
									timetableStatus.ok ? 'muted' : 'text-[var(--danger)]'
								}`}
							>
								{timetableStatus.text}
							</p>
						)}
					</section>

					<section className="border-t border-[var(--border)] pt-6">
						<h2 className="font-display text-lg font-bold">Delete account</h2>
						<p className="muted mt-1 text-sm">
							Permanently removes your profile, likes and RSVPs.
						</p>
						<button
							onClick={deleteAccount}
							className="btn btn-secondary mt-3 text-[var(--danger)]"
						>
							Delete account
						</button>
					</section>
				</aside>
			</div>
		</AppShell>
	);
}

export default Profile;
