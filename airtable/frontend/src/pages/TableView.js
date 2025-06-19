"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import "./TableView.css"

const TableView = ({ user, onLogout }) => {
  const { id } = useParams()
  const go = useNavigate()
  const [table, setTable] = useState(null)
  const [records, setRecords] = useState([])
  const [form, setForm] = useState({})
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const token = localStorage.getItem("token")
  const auth = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    axios.get(`http://localhost:5000/api/tables/${id}`, auth).then(res => {
      setTable(res.data)
      const empty = {}
      res.data.fields.forEach(field => (empty[field.name] = field.type === "checkbox" ? false : ""))
      setForm(empty)
    })
    axios.get(`http://localhost:5000/api/tables/${id}/records`, auth).then(res => setRecords(res.data))
  }, [id])

  const inputField = (field, val, setVal) => {
    if (field.type === "checkbox") return <input type="checkbox" checked={val} onChange={e => setVal(e.target.checked)} />
    if (field.type === "select" || field.type === "rating")
      return (
        <select value={val} onChange={e => setVal(e.target.value)}>
          <option value="">Select</option>
          {(field.options || [1, 2, 3, 4, 5]).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
      )
    if (field.type === "multiselect")
      return (
        <select multiple value={val || []} onChange={e => setVal(Array.from(e.target.selectedOptions, o => o.value))}>
          {field.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
        </select>
      )
    return <input type={field.type} value={val || ""} onChange={e => setVal(e.target.value)} />
  }

  const saveRecord = (e) => {
    e.preventDefault()
    axios.post(`http://localhost:5000/api/tables/${id}/records`, { data: form }, auth).then(() => {
      axios.get(`http://localhost:5000/api/tables/${id}/records`, auth).then(res => {
        setRecords(res.data)
        setAdding(false)
      })
    })
  }

  const updateRecord = (recId, data) => {
    axios.put(`http://localhost:5000/api/records/${recId}`, { data }, auth).then(() => {
      axios.get(`http://localhost:5000/api/tables/${id}/records`, auth).then(res => {
        setRecords(res.data)
        setEditingId(null)
      })
    })
  }

  const deleteRecord = (recId) => {
    axios.delete(`http://localhost:5000/api/records/${recId}`, auth).then(() => {
      axios.get(`http://localhost:5000/api/tables/${id}/records`, auth).then(res => setRecords(res.data))
    })
  }

  if (!table) return <div>Loading...</div>

  return (
    <div>
      <div className="header">
        <button onClick={() => go("/dashboard")}>← Back</button>
        <h2>{table.name}</h2>
        <div>
          <span>{user?.name}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      <button onClick={() => setAdding(!adding)}>{adding ? "Cancel" : "Add Record"}</button>

      {adding && (
        <form onSubmit={saveRecord}>
          {table.fields.map(field => (
            <div key={field.name}>
              <label>{field.name}</label>
              {inputField(field, form[field.name], val => setForm({ ...form, [field.name]: val }))}
            </div>
          ))}
          <button type="submit">Save</button>
        </form>
      )}

      <table>
        <thead>
          <tr>{table.fields.map(f => <th key={f.name}>{f.name}</th>)}<th>Actions</th></tr>
        </thead>
        <tbody>
          {records.map(row => (
            <tr key={row.id}>
              {table.fields.map(field => (
                <td key={field.name}>
                  {editingId === row.id
                    ? inputField(field, row.data[field.name], val => {
                        const newData = { ...row.data, [field.name]: val }
                        setRecords(records.map(rec => rec.id === row.id ? { ...rec, data: newData } : rec))
                      })
                    : Array.isArray(row.data[field.name])
                    ? row.data[field.name].join(", ")
                    : row.data[field.name]}
                </td>
              ))}
              <td>
                {editingId === row.id ? (
                  <>
                    <button onClick={() => updateRecord(row.id, row.data)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditingId(row.id)}>Edit</button>
                    <button onClick={() => deleteRecord(row.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableView
