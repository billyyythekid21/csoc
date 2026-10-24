import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const links = [
	{ to: '/', label: 'Home', end: true },
	{ to: '/match', label: 'Discover', end: false },
	{ to: '/matches', label: 'Matches', end: false },
	{ to: '/events', label: 'Events', end: false },
	{ to: '/search', label: 'Search', end: false },
];

const container = 'mx-auto w-full max-w-7xl px-6 md:px-10';

const linkClass = ({ isActive }: { isActive: boolean }) =>
	`hover:no-underline ${
		isActive
			? 'font-medium text-[var(--text)]'
			: 'text-[var(--muted)] hover:text-[var(--text)]'
	}`;

function AppShell({ children }: { children: ReactNode }) {
	const navigate = useNavigate();

	const logout = () => {
		localStorage.removeItem('token');
		navigate('/login');
	};

	return (
		<div className="min-h-screen">
			<header className="border-b border-[var(--border)]">
				<div
					className={`${container} flex flex-wrap items-center gap-x-8 gap-y-2 py-4`}
				>
					<NavLink
						to="/"
						className="font-display text-2xl font-extrabold tracking-tight text-[var(--text)] hover:text-[var(--accent)] hover:no-underline"
					>
						csoc
					</NavLink>
					<nav className="order-last flex w-full gap-4 text-sm sm:order-none sm:w-auto">
						{links.map((link) => (
							<NavLink
								key={link.to}
								to={link.to}
								end={link.end}
								className={linkClass}
							>
								{link.label}
							</NavLink>
						))}
					</nav>
					<div className="ml-auto flex items-center gap-4 text-sm">
						<NavLink to="/profile" className={linkClass}>
							Profile
						</NavLink>
						<button onClick={logout} className="btn-text">
							Log out
						</button>
					</div>
				</div>
			</header>
			<main className={`${container} py-10 md:py-12`}>{children}</main>
		</div>
	);
}

export default AppShell;
