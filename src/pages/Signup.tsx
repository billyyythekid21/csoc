import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Signup() {
	const navigate = useNavigate()
	const [form, setForm] = useState({ username: "", email: "", password: "" })
	const [error, setError] = useState("")

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			await axios.post("http://localhost:8000/users", form)
			navigate("/login")
		} catch (err) {
			setError("ERROR: Email or username may be unavailable.")
		}
	}

	return (
		<div>
			<h1>Sign Up</h1>
			{error && <p>{error}</p>}
			<form onSubmit={handleSubmit}>
				<input name="username" placeholder="Username" onChange={handleChange} />
				<input name="email" placeholder="Email" onChange={handleChange} />
				<input name="password" type="password" placeholder="Password" onChange={handleChange} />
				<button type="submit">Sign Up</button>
			</form>
			<p>Already have an account? <a href="/login">Login</a></p>
		</div>
	)
}

export default Signup