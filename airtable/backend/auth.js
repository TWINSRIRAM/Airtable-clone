import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const SECRET = process.env.JWT_SECRET;

export const auth = (req, res, next) => {
  const h = req.headers["authorization"];
  if (!h) return res.sendStatus(401);

  const t = h.startsWith("Bearer ") ? h.slice(7) : h;

  jwt.verify(t, SECRET, (e, d) => {
    if (e) return res.sendStatus(401);
    req.u = d;
    next();
  });
};

export const admin = (req, res, next) => {
  if (!req.u?.isAdmin) return res.sendStatus(403);
  next();
};

export const genToken = (p) => jwt.sign(p, SECRET, { expiresIn: "1d" });
