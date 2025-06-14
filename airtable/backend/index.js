import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import db from "./db.js";
import { generateToken, authenticate } from "./auth.js";
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(query, [name, email, hashedPassword], (err) => {
      if (err) return res.status(500).json({ error: "Registration failed" });
      res.json({ message: "User registered" });
    });
  } catch {
    res.status(500).json({ error: "Something went wrong" });
  }
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = results[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email
    });
    res.json({ token });
  });
});
app.get("/profile", authenticate, (req, res) => {
  res.json({ message: "Welcome to your profile", user: req.user });
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
