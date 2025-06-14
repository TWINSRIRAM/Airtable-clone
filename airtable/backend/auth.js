import jwt from "jsonwebtoken";

const JWT_SECRET = "8d88dcb7f573d6b2b6d2e14b74a80f0c5b8a7a7b729eeb5e402c7cfddfa88c1f";


export const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid or expired token" });

    req.user = decoded;
    next();
  });
};


export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: "Admin access required" });
  next();
};


export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h",
  });
};
