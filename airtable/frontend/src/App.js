"use client"
import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import "./App.css"
function App() {
  const [token, setToken] = useState(localStorage.getItem("token"))
  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])
  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken)
    setToken(newToken)
  }
  const handleLogout = () => {
    localStorage.removeItem("token")
    setToken(null)
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />
        <Route
          path="/dashboard"
          element={token ? <Dashboard token={token} onLogout={handleLogout} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  )
}
export default App
