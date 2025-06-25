import { useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import "./Auth.css"

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await axios.post("http://localhost:5000/api/login", { email, password })
      const { token, user } = res.data
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      onLogin(user)
    } catch (err) {
      setError(err.response?.data?.error || "Login failed")
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <h1>Airtable Clone</h1>
      <p>Sign in to your account</p>
      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p>
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  )
}

export default Login
