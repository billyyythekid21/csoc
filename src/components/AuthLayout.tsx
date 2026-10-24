import type { ReactNode } from 'react';

interface AuthLayoutProps {
	title: string;
	subtitle?: string;
	error?: string | null;
	children: ReactNode;
	footer: ReactNode;
}

function AuthLayout({
	title,
	subtitle,
	error,
	children,
	footer,
}: AuthLayoutProps) {
	return (
		<div className="flex min-h-screen">
			<section className="hatch hidden w-[52%] flex-col justify-between p-12 text-white md:flex">
				<p className="font-display text-3xl font-extrabold tracking-tight">
					csoc
				</p>

				<div className="max-w-md">
					<h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight lg:text-6xl">
						Touch grass.
						<br />
						Meet people.
					</h1>
					<p className="mt-5 text-lg leading-relaxed text-white/70">
						Find study partners, someone to sit with in your labs, and what's on
						around campus.
					</p>
				</div>

				<p className="text-sm text-white/45">Billy Wu 2026</p>
			</section>

			<section className="flex w-full flex-col justify-center px-6 py-12 md:w-[48%] md:px-16">
				<div className="mx-auto w-full max-w-sm">
					<p className="mb-8 font-display text-2xl font-extrabold tracking-tight md:hidden">
						csoc
					</p>

					<h2 className="font-display text-3xl font-bold tracking-tight">
						{title}
					</h2>
					{subtitle && <p className="muted mt-2">{subtitle}</p>}

					{error && (
						<p className="mt-6 border border-[var(--danger)]/30 bg-[var(--danger)]/8 px-4 py-3 text-sm text-[var(--danger)]">
							{error}
						</p>
					)}

					<div className="mt-8">{children}</div>

					<p className="muted mt-8 text-center text-sm">{footer}</p>
				</div>
			</section>
		</div>
	);
}

interface FieldProps {
	label: string;
	name: string;
	type?: string;
	autoComplete?: string;
	hint?: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Field({
	label,
	name,
	type = 'text',
	autoComplete,
	hint,
	onChange,
}: FieldProps) {
	return (
		<div>
			<label htmlFor={name} className="label">
				{label}
			</label>
			<input
				id={name}
				name={name}
				type={type}
				autoComplete={autoComplete}
				onChange={onChange}
				required
				className="input"
			/>
			{hint && <p className="hint">{hint}</p>}
		</div>
	);
}

export default AuthLayout;
