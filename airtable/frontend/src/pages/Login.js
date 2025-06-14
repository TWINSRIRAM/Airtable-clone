"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
      onLogin(response.data.token);
    } catch (error) {
      alert("Login failed. Please check your credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-logo">AIRTABLE</h1>
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to your workspace</p>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
