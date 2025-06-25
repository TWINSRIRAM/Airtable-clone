"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosWithAuth from "../utils/axiosWithAuth";
import "./CreateTable.css";

const CreateTable = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);

  const fieldTypes = [
    "text", "number", "email", "url", "phone", "date", "datetime-local",
    "checkbox", "select", "multiselect", "textarea", "rating", "file", "color"
  ];

  const addField = () => {
    setFields(prev => [
      ...prev,
      { id: Date.now(), name: "", type: "text", required: false, options: [] }
    ]);
  };

  const updateField = (id, key, value) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const addOption = (fieldId) => {
    const field = fields.find(f => f.id === fieldId);
    updateField(fieldId, "options", [...field.options, ""]);
  };

  const updateOption = (fieldId, index, value) => {
    const field = fields.find(f => f.id === fieldId);
    const options = [...field.options];
    options[index] = value;
    updateField(fieldId, "options", options);
  };

  const removeOption = (fieldId, index) => {
    const field = fields.find(f => f.id === fieldId);
    const options = field.options.filter((_, i) => i !== index);
    updateField(fieldId, "options", options);
  };

  const validateForm = () => {
    if (!name.trim()) return "Table name is required";
    if (fields.length === 0) return "At least one field is required";
    for (const f of fields) {
      if (!f.name.trim()) return "All fields must have a name";
      if ((f.type === "select" || f.type === "multiselect") && f.options.length === 0) {
        return `Field "${f.name}" must have at least one option`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) return alert(error);

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        fields: fields.map(f => ({
          ...f,
          name: f.name.trim(),
          options: f.options.map(o => o.trim()).filter(o => o)
        }))
      };
      const res = await axiosWithAuth().post("/api/tables", payload);
      navigate(`/table/${res.data.id}`);
    } catch (err) {
      alert("Failed to create table: " + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <div className="create-container">
      <header className="create-header">
        <button onClick={() => navigate("/dashboard")}>← Back</button>
        <h1>Create Table</h1>
        <div>
          <span>{user?.name}</span>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </header>

      <form className="create-form" onSubmit={handleSubmit}>
        {/* Table Name */}
        <div className="input-group">
          <label>Table Name<span style={{ color: 'red' }}>*</span></label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter table name"
            required
          />
        </div>

        {/* Description */}
        <div className="input-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
          />
        </div>

        {/* Fields */}
        {fields.map(f => (
          <div key={f.id} className="field-block">
            <div className="field-row">
              <input
                value={f.name}
                onChange={e => updateField(f.id, "name", e.target.value)}
                placeholder="Field name"
                required
              />
              <select
                value={f.type}
                onChange={e => updateField(f.id, "type", e.target.value)}
              >
                {fieldTypes.map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <label>
                <input
                  type="checkbox"
                  checked={f.required}
                  onChange={e => updateField(f.id, "required", e.target.checked)}
                />
                Required
              </label>
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeField(f.id)}
              >
                Remove
              </button>
            </div>

            {(f.type === "select" || f.type === "multiselect") && (
              <div className="option-section">
                <button
                  type="button"
                  className="add-option-btn"
                  onClick={() => addOption(f.id)}
                >
                  + Option
                </button>
                {f.options.map((opt, idx) => (
                  <div key={idx} className="option-row">
                    <input
                      value={opt}
                      onChange={e => updateOption(f.id, idx, e.target.value)}
                      placeholder="Option value"
                    />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeOption(f.id, idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Button Row */}
        <div className="button-row">
          <button
            type="button"
            className="add-field-btn"
            onClick={addField}
          >
            + Add Field
          </button>

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Table"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTable;
