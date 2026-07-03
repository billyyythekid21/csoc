import {useEffect, useState} from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function Home() {
    const navigate = useNavigate()
    const [user, setUser] = useState<{ username: string; email: string } | null>(null)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            navigate("/login")
            return
        }
        axios.get("http://localhost:8000/me", {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => setUser(res.data))
            .catch(() => {
                localStorage.removeItem("token")
                navigate("/login")
            })
    }, [])

    const logout = () => {
        localStorage.removeItem("token")
        navigate("/login")
    }

    if (!user) return <div>Loading...</div>

    return (
        <div>
            <h1>Welcome, {user.username}</h1>
            <p>{user.email}</p>
            <button onClick={logout}>Logout</button>
        </div>
    )
}

export default Home