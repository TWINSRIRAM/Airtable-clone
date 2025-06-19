"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import "./Dashboard.css"

const Dashboard = ({ user, onLogout }) => {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No authentication token found")
        onLogout()
        return
      }

      console.log("Fetching tables...")
      const response = await axios.get("/api/tables", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Tables fetched:", response.data)
      setTables(response.data)
      setError("")
    } catch (error) {
      console.error("Fetch tables error:", error)

      if (error.code === "ERR_NETWORK") {
        setError("Cannot connect to server. Make sure the backend is running on http://localhost:5000")
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        setError("Authentication failed. Please login again.")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        onLogout()
      } else {
        setError("Failed to fetch tables: " + (error.response?.data?.error || error.message))
      }
    }
    setLoading(false)
  }

  const deleteTable = async (tableId) => {
    if (!window.confirm("Are you sure you want to delete this table?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      await axios.delete(`/api/tables/${tableId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      setTables(tables.filter((table) => table.id !== tableId))
      setError("")
    } catch (error) {
      console.error("Delete table error:", error)

      if (error.response?.status === 401 || error.response?.status === 403) {
        setError("Authentication failed. Please login again.")
        onLogout()
      } else {
        setError("Failed to delete table: " + (error.response?.data?.error || error.message))
      }
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Airtable Clone</h1>
          <div className="header-actions">
            <span className="welcome-text">Welcome, {user?.name}</span>
            <button onClick={onLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          <div className="dashboard-top">
            <h2>My Tables</h2>
            <Link to="/create-table" className="create-table-btn">
              Create New Table
            </Link>
          </div>

          {error && <div className="error-message">{error}</div>}

          {tables.length === 0 && !error ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No tables yet</h3>
              <p>Create your first table to get started with organizing your data</p>
              <Link to="/create-table" className="create-first-table-btn">
                Create Your First Table
              </Link>
            </div>
          ) : (
            <div className="tables-grid">
              {tables.map((table) => (
                <div key={table.id} className="table-card">
                  <div className="table-card-header">
                    <h3>{table.name}</h3>
                    <div className="table-actions">
                      <Link to={`/table/${table.id}`} className="view-btn">
                        View
                      </Link>
                      <button onClick={() => deleteTable(table.id)} className="delete-btn">
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="table-description">{table.description || "No description"}</p>
                  <div className="table-meta">
                    <span>Created: {new Date(table.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
