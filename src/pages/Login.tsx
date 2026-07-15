import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout, { Field } from '../components/AuthLayout';

function Login() {
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: '', password: '' });
	const [error, setError] = useState<string | null>(null);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await axios.post('http://localhost:8000/login', form);
			localStorage.setItem('token', res.data.token);
			navigate('/');
		} catch {
			setError('Invalid email or password');
		}
	};

	return (
		<AuthLayout
			title="Welcome Back!"
			subtitle="Good to see you again!"
			error={error}
			footer={
				<>
					No account?{' '}
					<Link
						to="/signup"
						className="text-green-400 hover:text-green-300 transition"
					>
						Sign up
					</Link>
				</>
			}
		>
			<form
				onSubmit={handleSubmit}
				className="flex flex-col gap-4"
			>
				<Field
					label="Email"
					name="email"
					placeholder="yourname@email.com"
					autoComplete="email"
					onChange={handleChange}
				/>
				<Field
					label="Password"
					name="password"
					type="password"
					placeholder="••••••••"
					autoComplete="current-password"
					onChange={handleChange}
				/>
				<button
					type="submit"
					className="bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg py-3 mt-2 transition"
				>
					Log in
				</button>
			</form>
		</AuthLayout>
	);
}

export default Login;
