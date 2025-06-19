"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import "./Register.css"

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [load, setLoad] = useState(false)
  const go = useNavigate()

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoad(true)
    setError("")

    try {
      const res = await axios.post("/api/register", form)
      if (res.data.token) {
        localStorage.setItem("token", res.data.token)
        go("/dashboard")
      } else {
        setError("Unexpected error. Try again.")
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Email already exists")
      } else if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError("Registration failed")
      }
    }

    setLoad(false)
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join Airtable Clone today</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={submit} className="register-form">
          <div className="form-group">
            <input
              name="name"
              value={form.name}
              onChange={change}
              placeholder="Full Name"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              name="email"
              value={form.email}
              onChange={change}
              placeholder="Email"
              type="email"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <input
              name="password"
              value={form.password}
              onChange={change}
              placeholder="Password"
              type="password"
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="register-btn" disabled={load}>
            {load ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account? <Link to="/">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
