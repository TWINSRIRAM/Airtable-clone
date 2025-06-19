import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import db from "./db.js";
import { genToken as token, auth } from "./auth.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/reg", async (req, res) => {
  const { name, email, password: p } = req.body;
  try {
    const hp = await bcrypt.hash(p, 10);
    db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hp], (e) => {
      if (e) return res.sendStatus(500);
      res.json({ msg: "ok" });
    });
  } catch {
    res.sendStatus(500);
  }
});

app.post("/login", (req, res) => {
  const { email, password: p } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], async (e, r) => {
    if (e || r.length === 0) return res.sendStatus(401);
    const u = r[0];
    const ok = await bcrypt.compare(p, u.password);
    if (!ok) return res.sendStatus(401);
    const t = token({ id: u.id, name: u.name, email: u.email });
    res.json({ token: t });
  });
});

app.get("/me", auth, (req, res) => {
  res.json({ user: req.u });
});

app.listen(port, () => {
  console.log(`🚀 http://localhost:${port}`);
});
