import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Login() {
	const navigate = useNavigate()
	const [form, setForm] = useState({ email: "", password: "" })
	const [error, setError] = useState<string | null>(null)

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			const res = await axios.post("http://localhost:8000/login", form)
			localStorage.setItem("token", res.data.token)
			navigate("/")
		} catch {
			setError("Invalid email or password")
		}
	}

	return (
		<div className="min-h-screen bg-black flex">
			{/* Left panel */}
			<div className="flex flex-col justify-between w-1/2 bg-green-500 p-12">
				<span className="text-black font-bold text-xl">csoc</span>
				<div>
					<h1 className="text-black text-5xl font-bold leading-tight mb-4">
						Touch grass.<br />Meet people.
					</h1>
					<p className="text-black/70 text-lg">
						For CS students who spend too much time inside.
					</p>
				</div>
			</div>

			{/* Right panel */}
			<div className="flex flex-col justify-center w-full md:w-1/2 p-8 md:p-16">
				<div className="max-w-sm w-full mx-auto">
					<h2 className="text-white text-3xl font-bold mb-2">Log in</h2>
					<p className="text-gray-500 mb-8">Good to see you again!</p>

					{error && (
						<div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<div className="flex flex-col gap-1">
							<label className="text-gray-400 text-sm">Email</label>
							<input
								name="email"
								placeholder="yourname@email.com"
								onChange={handleChange}
								className="bg-gray-900 border border-gray-800 text-white placeholder-gray-600 rounded-lg px-4 py-3 outline-none focus:border-green-500 transition"
							/>
						</div>
						<div className="flex flex-col gap-1">
							<label className="text-gray-400 text-sm">Password</label>
							<input
								name="password"
								type="password"
								placeholder="••••••••"
								onChange={handleChange}
								className="bg-gray-900 border border-gray-800 text-white placeholder-gray-600 rounded-lg px-4 py-3 outline-none focus:border-green-500 transition"
							/>
						</div>
						<button
							type="submit"
							className="bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg py-3 mt-2 transition"
						>
							Log in
						</button>
					</form>

					<p className="text-gray-600 mt-6 text-center text-sm">
						No account?{" "}
						<a href="/signup" className="text-green-400 hover:text-green-300 transition">
							Sign up
						</a>
					</p>
				</div>
			</div>
		</div>
	)
}

export default Login