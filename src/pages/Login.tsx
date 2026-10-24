import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout, { Field } from '../components/AuthLayout';

function Login() {
	const navigate = useNavigate();
	const [form, setForm] = useState({ email: '', password: '' });
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			const res = await axios.post('/login', form);
			localStorage.setItem('token', res.data.token);
			navigate('/');
		} catch {
			setError('Wrong email or password.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<AuthLayout
			title="Log in"
			error={error}
			footer={
				<>
					No account? <Link to="/signup">Sign up</Link>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<Field
					label="Email"
					name="email"
					type="email"
					autoComplete="email"
					onChange={handleChange}
				/>
				<Field
					label="Password"
					name="password"
					type="password"
					autoComplete="current-password"
					onChange={handleChange}
				/>
				<button
					type="submit"
					disabled={submitting}
					className="btn btn-primary mt-1"
				>
					{submitting ? 'Logging in…' : 'Log in'}
				</button>
			</form>
		</AuthLayout>
	);
}

export default Login;
