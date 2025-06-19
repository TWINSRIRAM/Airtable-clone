const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const secret = process.env.JWT_SECRET;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const auth = (req, res, next) => {
  const h = req.headers["authorization"];
  if (!h) return res.sendStatus(401);
  const t = h.startsWith("Bearer ") ? h.slice(7) : h;
  jwt.verify(t, secret, (e, d) => {
    if (e) return res.sendStatus(403);
    req.u = d;
    next();
  });
};

app.get("/", (req, res) => res.json({ msg: "API ok" }));

app.get("/api/test", (req, res) => {
  db.query("SELECT 1", (e, r) => {
    if (e) return res.sendStatus(500);
    res.json({ msg: "DB ok" });
  });
});

app.post("/api/register", async (req, res) => {
  const { name, email, password: p } = req.body;
  db.query("SELECT id FROM users WHERE email=?", [email], async (e, r) => {
    if (r.length) return res.sendStatus(400);
    const hp = await bcrypt.hash(p, 10);
    db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hp], (e) => {
      if (e) return res.sendStatus(500);
      res.json({ msg: "reg ok" });
    });
  });
});

app.post("/api/login", (req, res) => {
  const { email, password: p } = req.body;
  db.query("SELECT * FROM users WHERE email=?", [email], async (e, r) => {
    if (r.length === 0) return res.sendStatus(401);
    const u = r[0];
    const ok = await bcrypt.compare(p, u.password);
    if (!ok) return res.sendStatus(401);
    const t = jwt.sign({ id: u.id, name: u.name, email: u.email }, secret, { expiresIn: "1d" });
    res.json({ token: t, user: { id: u.id, name: u.name, email: u.email } });
  });
});

app.get("/api/tables", auth, (req, res) => {
  db.query("SELECT * FROM tables WHERE user_id=? ORDER BY created_at DESC", [req.u.id], (e, r) => {
    if (e) return res.sendStatus(500);
    res.json(r);
  });
});

app.post("/api/tables", auth, (req, res) => {
  const { name, description = "", fields } = req.body;
  if (!name || !fields?.length) return res.sendStatus(400);
  db.query(
    "INSERT INTO tables (name, description, fields, user_id) VALUES (?, ?, ?, ?)",
    [name, description, JSON.stringify(fields), req.u.id],
    (e, r) => {
      if (e) return res.sendStatus(500);
      res.json({ id: r.insertId });
    }
  );
});

app.get("/api/tables/:id", auth, (req, res) => {
  db.query("SELECT * FROM tables WHERE id=? AND user_id=?", [req.params.id, req.u.id], (e, r) => {
    if (!r.length) return res.sendStatus(404);
    const t = r[0];
    try {
      t.fields = JSON.parse(t.fields);
      res.json(t);
    } catch {
      res.sendStatus(500);
    }
  });
});

app.delete("/api/tables/:id", auth, (req, res) => {
  db.query("DELETE FROM tables WHERE id=? AND user_id=?", [req.params.id, req.u.id], (e, r) => {
    if (!r.affectedRows) return res.sendStatus(404);
    res.json({ msg: "deleted" });
  });
});

app.get("/api/tables/:id/records", auth, (req, res) => {
  db.query("SELECT * FROM records WHERE table_id=? ORDER BY created_at DESC", [req.params.id], (e, r) => {
    if (e) return res.sendStatus(500);
    const out = r.map((rec) => {
      try {
        rec.data = JSON.parse(rec.data);
        return rec;
      } catch {
        return { ...rec, data: {} };
      }
    });
    res.json(out);
  });
});

app.post("/api/tables/:id/records", auth, (req, res) => {
  const { data } = req.body;
  if (!data) return res.sendStatus(400);
  db.query("INSERT INTO records (table_id, data) VALUES (?, ?)", [req.params.id, JSON.stringify(data)], (e, r) => {
    if (e) return res.sendStatus(500);
    res.json({ id: r.insertId });
  });
});

app.put("/api/records/:id", auth, (req, res) => {
  const { data } = req.body;
  if (!data) return res.sendStatus(400);
  db.query("UPDATE records SET data=? WHERE id=?", [JSON.stringify(data), req.params.id], (e, r) => {
    if (!r.affectedRows) return res.sendStatus(404);
    res.json({ msg: "updated" });
  });
});

app.delete("/api/records/:id", auth, (req, res) => {
  db.query("DELETE FROM records WHERE id=?", [req.params.id], (e, r) => {
    if (!r.affectedRows) return res.sendStatus(404);
    res.json({ msg: "deleted" });
  });
});

app.listen(port, () => {
  console.log(`🚀 http://localhost:${port}`);
});
