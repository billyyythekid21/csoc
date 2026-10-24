import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthLayout, { Field } from '../components/AuthLayout';

function Signup() {
	const navigate = useNavigate();
	const [form, setForm] = useState({ username: '', email: '', password: '' });
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		try {
			await axios.post('/users', form);
			navigate('/login');
		} catch (err) {
			if (axios.isAxiosError(err) && err.response?.data?.detail) {
				setError(err.response.data.detail);
			} else {
				setError('That email or username may already be taken.');
			}
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<AuthLayout
			title="Create an account"
			subtitle="You can add your course and interests after signing up."
			error={error}
			footer={
				<>
					Already have an account? <Link to="/login">Log in</Link>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4">
				<Field
					label="Username"
					name="username"
					autoComplete="username"
					onChange={handleChange}
				/>
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
					autoComplete="new-password"
					hint="At least 8 characters."
					onChange={handleChange}
				/>
				<button
					type="submit"
					disabled={submitting}
					className="btn btn-primary mt-1"
				>
					{submitting ? 'Creating account…' : 'Create account'}
				</button>
			</form>
		</AuthLayout>
	);
}

export default Signup;
