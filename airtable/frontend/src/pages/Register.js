import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import "./Auth.css"

const Register = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await axios.post("http://localhost:5000/api/register", { name, email, password })
      alert("Registration successful!")
      navigate("/login")
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed")
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <h1>Create Account</h1>
      <p>Join Airtable Clone today</p>
      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          placeholder="Full Name"
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}

export default Register
