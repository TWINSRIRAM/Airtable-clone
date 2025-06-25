const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const db = require("./db");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const secret = process.env.JWT_SECRET || "twinsriram07";


app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });


const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
};


app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  db.query("SELECT id FROM users WHERE email = ?", [email], async (err, rows) => {
    if (rows?.length) return res.status(400).json({ error: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hash]);
    res.json({ message: "Registered" });
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, rows) => {
    if (!rows?.length) return res.sendStatus(401);

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.sendStatus(401);

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, secret, { expiresIn: "1d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  });
});


app.get("/api/tables", auth, (req, res) => {
  db.query("SELECT * FROM tables WHERE user_id = ? ORDER BY created_at DESC", [req.user.id], (err, rows) => {
    res.json(rows);
  });
});

app.post("/api/tables", auth, (req, res) => {
  const { name, description = "", fields } = req.body;

  db.query(
    "INSERT INTO tables (name, description, fields, user_id) VALUES (?, ?, ?, ?)",
    [name, description, JSON.stringify(fields), req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId });
    }
  );
});

app.get("/api/tables/:id", auth, (req, res) => {
  db.query("SELECT * FROM tables WHERE id = ? AND user_id = ?", [req.params.id, req.user.id], (err, rows) => {
    const table = rows[0];
    if (!table) return res.sendStatus(404);
    if (typeof table.fields === "string") table.fields = JSON.parse(table.fields);
    res.json(table);
  });
});

app.delete("/api/tables/:id", auth, (req, res) => {
  db.query("DELETE FROM tables WHERE id = ? AND user_id = ?", [req.params.id, req.user.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Deleted" });
  });
});

app.get("/api/tables/:id/records", auth, (req, res) => {
  db.query("SELECT * FROM records WHERE table_id = ?", [req.params.id], (err, rows) => {
    const records = rows.map((r) => ({
      ...r,
      data: typeof r.data === "string" ? JSON.parse(r.data) : r.data,
    }));
    res.json(records);
  });
});

app.post("/api/tables/:id/records", auth, upload.any(), (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;
    const data = {};

    for (const key in req.body) {
      try {
        data[key] = JSON.parse(req.body[key]);
      } catch {
        data[key] = req.body[key];
      }
    }

    files.forEach(file => {
      data[file.fieldname] = file.filename;
    });

    db.query(
      "INSERT INTO records (table_id, data) VALUES (?, ?)",
      [id, JSON.stringify(data)],
      (err, result) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ error: err });
        }
        res.json({ id: result.insertId });
      }
    );
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.toString() });
  }
});

app.put("/api/records/:id", auth, upload.any(), (req, res) => {
  const { id } = req.params;
  const files = req.files;
  const data = {};

  for (const key in req.body) {
    try {
      data[key] = JSON.parse(req.body[key]);
    } catch {
      data[key] = req.body[key];
    }
  }

  files.forEach(file => {
    data[file.fieldname] = file.filename;
  });

  db.query(
    "UPDATE records SET data = ? WHERE id = ?",
    [JSON.stringify(data), id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Updated" });
    }
  );
});

app.delete("/api/records/:id", auth, (req, res) => {
  db.query("DELETE FROM records WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Deleted" });
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
