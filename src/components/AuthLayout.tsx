import type { ReactNode } from 'react';

interface AuthLayoutProps {
	title: string;
	subtitle: string;
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
		<div className="min-h-screen bg-black flex">
			{/* Left panel */}
			<div className="hidden md:flex flex-col justify-between md:w-1/2 bg-green-500 p-12">
				<span className="text-black font-bold text-xl">csoc</span>
				<div>
					<h1 className="text-black text-5xl font-bold leading-tight mb-4">
						Touch grass.
						<br />
						Meet people.
					</h1>
					<p className="text-black/70 text-lg">
						For CS students who spend too much time inside.
					</p>
				</div>
			</div>

			{/* Right panel */}
			<div className="flex flex-col justify-center w-full md:w-1/2 p-8 md:p-16">
				<div className="max-w-sm w-full mx-auto">
					<h2 className="text-white text-3xl font-bold mb-2">
						{title}
					</h2>
					<p className="text-gray-500 mb-8">{subtitle}</p>

					{error && (
						<div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
							{error}
						</div>
					)}

					{children}

					<p className="text-gray-600 mt-6 text-center text-sm">
						{footer}
					</p>
				</div>
			</div>
		</div>
	);
}

interface FieldProps {
	label: string;
	name: string;
	type?: string;
	placeholder?: string;
	autoComplete?: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Field({
	label,
	name,
	type = 'text',
	placeholder,
	autoComplete,
	onChange,
}: FieldProps) {
	return (
		<div className="flex flex-col gap-1">
			<label
				htmlFor={name}
				className="text-gray-400 text-sm"
			>
				{label}
			</label>
			<input
				id={name}
				name={name}
				type={type}
				placeholder={placeholder}
				autoComplete={autoComplete}
				onChange={onChange}
				className="bg-gray-900 border border-gray-800 text-white placeholder-gray-600 rounded-lg px-4 py-3 outline-none focus:border-green-500 transition"
			/>
		</div>
	);
}

export default AuthLayout;
