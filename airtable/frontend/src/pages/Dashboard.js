import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../utils/axiosWithAuth";
import "./Dashboard.css";

const Dashboard = ({ user, onLogout }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const api = axios();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get("/api/tables");
      setTables(response.data);
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("Session expired. Please login again.");
        window.location.href = "/login";
      } else {
        alert("Failed to fetch tables.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteTable = async (tableId) => {
    if (!window.confirm("Are you sure you want to delete this table?")) return;
    try {
      await api.delete(`/api/tables/${tableId}`);
      setTables((prev) => prev.filter((table) => table.id !== tableId));
    } catch {
      alert("Failed to delete table.");
    }
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="dashboard-nav">
        <div className="dashboard-logo">
          <div className="logo-box">
            <span className="logo-text">A</span>
          </div>
          <h1 className="logo-title">Airtable</h1>
        </div>
        <div className="dashboard-user">
          <span className="user-name">{user?.name}</span>
          <button onClick={onLogout} className="btn-outline">
            Sign out
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="dashboard-main">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="workspace-header">
            <h2>Workspace</h2>
            <div className="workspace-box">
              <div className="workspace-initial">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span>{user?.name}'s workspace</span>
            </div>
            <div className="create-link-wrapper">
              <Link to="/create-table" className="create-link">
                ＋ Create new base
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          <div className="content-header">
            <h1>Home</h1>
            <p>Welcome back, {user?.name}</p>
          </div>

          <section className="tables-section">
            <div className="section-header">
              <h2>Recently opened bases</h2>
            </div>

            {tables.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>No bases yet</h3>
                <p>
                  Create your first base to start organizing your data with
                  tables, forms, and more.
                </p>
                <Link to="/create-table" className="btn-primary">
                  Create your first base
                </Link>
              </div>
            ) : (
              <div className="tables-grid">
                {tables.map((table) => (
                  <div key={table.id} className="table-card">
                    
                    <div className="table-card-actions">
                      <Link
                        to={`/table/${table.id}`}
                        style={{
                          padding: "6px 14px",
                          backgroundColor: "#2563eb",
                          color: "white",
                          borderRadius: "999px",
                          textDecoration: "none",
                          fontSize: "14px",
                          border: "none",
                          cursor: "pointer",
                          display: "inline-block",
                        }}
                      >
                        Open
                      </Link>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTable(table.id);
                        }}
                        style={{
                          padding: "6px 14px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          borderRadius: "999px",
                          fontSize: "14px",
                          border: "none",
                          cursor: "pointer",
                          display: "inline-block",
                          marginLeft: "8px",
                        }}
                      >
                        Delete
                      </button>
                    </div>

                    <div className="table-card-body">
                      <div className="table-card-title">
                        <div className="table-icon">📋</div>
                        <h3>{table.name}</h3>
                      </div>
                      <p>{table.description || "No description provided"}</p>
                      <div className="table-meta">
                        <span>
                          Created{" "}
                          {new Date(table.created_at).toLocaleDateString()}
                        </span>
                        <span>Personal workspace</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
