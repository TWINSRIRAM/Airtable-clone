"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import "./TableView.css"

const TableView = ({ user, onLogout }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [table, setTable] = useState(null)
  const [records, setRecords] = useState([])
  const [form, setForm] = useState({})
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const token = localStorage.getItem("token")
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    fetchTable()
    fetchRecords()
  }, [id])

  const fetchTable = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`http://localhost:5000/api/tables/${id}`, authHeaders)
      setTable(res.data)

      const empty = {}
      res.data.fields.forEach(f => {
        empty[f.name] = f.type === "checkbox" ? false : f.type === "multiselect" ? [] : ""
      })
      setForm(empty)
    } catch {
      setError("Failed to load table")
    } finally {
      setLoading(false)
    }
  }

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tables/${id}/records`, authHeaders)
      setRecords(res.data)
    } catch {
      console.error("Error fetching records")
    }
  }

  const validate = (field, value) => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) return `${field.name} is required`
    if (field.type === "email" && value && !/\S+@\S+\.\S+/.test(value)) return `Invalid email`
    if (field.type === "url" && value && !/^https?:\/\/.+/.test(value)) return `Invalid URL`
    if (field.type === "number" && value && isNaN(value)) return `Must be a number`
    return null
  }

  const validateForm = (data) => {
    for (const f of table.fields) {
      const err = validate(f, data[f.name])
      if (err) return err
    }
    return null
  }

  const renderInput = (field, value, setValue) => {
    const change = (e) => setValue(e.target.value)
    switch (field.type) {
      case "checkbox":
        return <input type="checkbox" checked={value || false} onChange={e => setValue(e.target.checked)} />
      case "select":
        return (
          <select value={value || ""} onChange={change} className="field-input">
            <option value="">Select</option>
            {(field.options || []).map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        )
      case "multiselect":
        return (
          <select multiple value={value || []} onChange={e => setValue(Array.from(e.target.selectedOptions, o => o.value))} className="field-input">
            {(field.options || []).map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        )
      case "textarea":
        return <textarea value={value || ""} onChange={change} className="field-input" rows={3} />
      case "rating":
        return (
          <select value={value || ""} onChange={change} className="field-input">
            <option value="">Rating</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""}</option>)}
          </select>
        )
      default:
        return <input type={field.type} value={value || ""} onChange={change} className="field-input" />
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validateForm(form)
    if (err) return alert(err)

    try {
      await axios.post(`http://localhost:5000/api/tables/${id}/records`, { data: form }, authHeaders)
      setForm({})
      setAdding(false)
      fetchRecords()
    } catch {
      alert("Failed to save record")
    }
  }

  const handleUpdate = async (rid, data) => {
    const err = validateForm(data)
    if (err) return alert(err)
    try {
      await axios.put(`http://localhost:5000/api/records/${rid}`, { data }, authHeaders)
      setEditingId(null)
      fetchRecords()
    } catch {
      alert("Failed to update record")
    }
  }

  const handleDelete = async (rid) => {
    if (!window.confirm("Delete this record?")) return
    try {
      await axios.delete(`http://localhost:5000/api/records/${rid}`, authHeaders)
      fetchRecords()
    } catch {
      alert("Failed to delete record")
    }
  }

  if (loading) return <div className="center">Loading table...</div>
  if (error) return <div className="center error">{error}</div>
  if (!table) return <div className="center">Table not found</div>

  return (
    <div className="table-container">
      <div className="table-header">
        <button onClick={() => navigate("/dashboard")} className="back-btn">← Back</button>
        <h2>{table.name}</h2>
        <div className="user-actions">
          <span>{user?.name}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <button onClick={() => setAdding(!adding)} className={`toggle-btn ${adding ? "cancel" : "add"}`}>
        {adding ? "Cancel" : "Add Record"}
      </button>

      {adding && (
        <form onSubmit={handleSubmit} className="record-form">
          {table.fields.map(f => (
            <div key={f.name} className="field-group">
              <label>{f.name} {f.required && <span>*</span>}</label>
              {renderInput(f, form[f.name], val => setForm({ ...form, [f.name]: val }))}
            </div>
          ))}
          <button type="submit" className="save-btn">Save Record</button>
        </form>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              {table.fields.map(f => <th key={f.name}>{f.name}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => (
              <tr key={record.id}>
                {table.fields.map(f => (
                  <td key={f.name}>
                    {editingId === record.id ? (
                      renderInput(f, record.data[f.name], val => {
                        const updated = { ...record.data, [f.name]: val }
                        setRecords(records.map(r => r.id === record.id ? { ...r, data: updated } : r))
                      })
                    ) : (
                      <span>
                        {Array.isArray(record.data[f.name]) ? record.data[f.name].join(", ") :
                          f.type === "checkbox" ? (record.data[f.name] ? "Yes" : "No") :
                          record.data[f.name] || "-"}
                      </span>
                    )}
                  </td>
                ))}
                <td>
                  {editingId === record.id ? (
                    <>
                      <button onClick={() => handleUpdate(record.id, record.data)} className="action-btn save">Save</button>
                      <button onClick={() => setEditingId(null)} className="action-btn cancel">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingId(record.id)} className="action-btn edit">Edit</button>
                      <button onClick={() => handleDelete(record.id)} className="action-btn delete">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {records.length === 0 && <div className="no-records">No records yet. Click "Add Record" to create one.</div>}
    </div>
  )
}

export default TableView
