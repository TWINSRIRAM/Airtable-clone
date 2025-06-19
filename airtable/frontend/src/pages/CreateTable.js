"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./CreateTable.css"

const CreateTable = ({ user, onLogout }) => {
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [fields, setFields] = useState([])
  const [load, setLoad] = useState(false)
  const nav = useNavigate()

const types = [
  "text",
  "number",
  "email",
  "url",
  "phone",
  "date",
  "datetime-local",
  "checkbox",
  "select",
  "multiselect",
  "textarea",
  "rating"
]

  const addField = () => {
    setFields([...fields, { id: Date.now(), name: "", type: "text", required: false, options: [] }])
  }

  const setVal = (id, key, val) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: val } : f))
  }

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id))
  }

  const addOpt = (id) => {
    const f = fields.find(f => f.id === id)
    setVal(id, "options", [...f.options, ""])
  }

  const setOpt = (id, idx, val) => {
    const f = fields.find(f => f.id === id)
    const newOpts = [...f.options]
    newOpts[idx] = val
    setVal(id, "options", newOpts)
  }

  const removeOpt = (id, idx) => {
    const f = fields.find(f => f.id === id)
    const newOpts = f.options.filter((_, i) => i !== idx)
    setVal(id, "options", newOpts)
  }

  const send = async (e) => {
    e.preventDefault()
    setLoad(true)
    const token = localStorage.getItem("token")
    const data = {
      name: name.trim(),
      description: desc.trim(),
      fields: fields.map(f => ({
        ...f,
        name: f.name.trim(),
        options: f.options.map(o => o.trim())
      }))
    }
    const res = await axios.post("http://localhost:5000/api/tables", data, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    })
    nav(`/table/${res.data.id}`)
    setLoad(false)
  }

  return (
    <div className="create-table">
      <div className="create-table-header">
        <button onClick={() => nav("/dashboard")} className="back-btn">← Back</button>
        <h1>Create Table</h1>
        <div className="user-info">
          <span>{user?.name}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <form onSubmit={send} className="create-table-form">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Table name" />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />

        <button type="button" onClick={addField}>Add Field</button>

        {fields.map((f, i) => (
          <div key={f.id} className="field-item">
            <input value={f.name} onChange={(e) => setVal(f.id, "name", e.target.value)} placeholder="Field name" />
            <select value={f.type} onChange={(e) => setVal(f.id, "type", e.target.value)}>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label>
              <input type="checkbox" checked={f.required} onChange={(e) => setVal(f.id, "required", e.target.checked)} />
              Required
            </label>
            <button type="button" onClick={() => removeField(f.id)}>Remove</button>

            {(f.type === "select" || f.type === "multiselect") && (
              <>
                <button type="button" onClick={() => addOpt(f.id)}>+ Option</button>
                {f.options.map((o, j) => (
                  <div key={j}>
                    <input value={o} onChange={(e) => setOpt(f.id, j, e.target.value)} placeholder="Option" />
                    <button type="button" onClick={() => removeOpt(f.id, j)}>x</button>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}

        <button type="submit" disabled={load}>{load ? "Creating..." : "Create"}</button>
      </form>
    </div>
  )
}

export default CreateTable
