import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import db from "./db.js";
import { genToken as token, auth } from "./auth.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post("/reg", async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hash], () => {
    res.json({ msg: "ok" });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, rows) => {
    if (!rows.length) return res.sendStatus(401);
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.sendStatus(401);
    const t = token({ id: user.id, name: user.name, email: user.email });
    res.json({ token: t });
  });
});

app.get("/me", auth, (req, res) => {
  res.json({ user: req.u });
});

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
