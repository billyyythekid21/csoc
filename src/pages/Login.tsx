import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Login() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: "", password: "" })
    const [error, setError] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await axios.post("http://localhost:8000/login", form)
            localStorage.setItem("token", res.data.token)
            navigate("/")
        } catch (err) {
            setError("Invalid email or password")
        }
    }

    return (
        <div>
            <h1>Login</h1>
            {error && <p>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input name="email" placeholder="Email" onChange={handleChange} />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} />
                <button type="submit">Login</button>
            </form>
            <p>No account? <a href="/signup">Sign Up!</a></p>
        </div>
    )
}

export default Login