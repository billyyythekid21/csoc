import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

interface UserProfile {
	username: string
	email: string
	bio: string
	location: string
	course: string
	contact: string
	interests: string
}

function Profile() {
	const navigate = useNavigate()
	const [profile, setProfile] = useState<UserProfile | null>(null)
	const [form, setForm] = useState({ bio: "", location: "", course: "", contact: "", interests: "" })
	const [saved, setSaved] = useState<boolean>(false)

	const token = localStorage.getItem("token")

	useEffect(() => {
		if (!token) { navigate("/login"); return; }

		axios.get("http://localhost:8000/me", {
			headers: { Authorization: `Bearer ${token}` }
		})
			.then(res => {
				setProfile(res.data)
				setForm({
					bio: res.data.bio || "",
					location: res.data.location || "",
					course: res.data.course || "",
					contact: res.data.contact || "",
					interests: res.data.interests || "",
				})
			})
			.catch(() => { localStorage.removeItem("token"); navigate("/login") })
	}, [])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		await axios.patch("http://localhost:8000/me", form, {
			headers: { Authorization: `Bearer ${token}` }
		})
		setSaved(true)
		setTimeout(() => { setSaved(false) }, 2000)
	}

	if (!profile) return <div>Loading...</div>

	return (
		<div>
			<h1>{profile.username}</h1>
			<p>{profile.email}</p>
			<form onSubmit={handleSubmit}>
				<textarea name="bio" placeholder="Bio" value={form.bio} onChange={handleChange} />
				<input name="course" placeholder="Course (e.g. Computer Science)"
					   value={form.course} onChange={handleChange} />
				<input name="location" placeholder="Location (e.g. Melbourne)"
					   value={form.location} onChange={handleChange} />
				<input name="contact" placeholder="Contact (e.g. Discord handle)"
					   value={form.contact} onChange={handleChange} />
				<input name="interests" placeholder="Interests (e.g. hiking, chess, ml)"
					   value={form.interests} onChange={handleChange} />
				<button type="submit">Save</button>
			</form>
			{saved && <p>Saved!</p>}
			<button onClick={() => navigate("/")}>Back</button>
		</div>
	)
}

export default Profile