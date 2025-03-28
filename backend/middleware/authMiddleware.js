import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  console.log("Auth middleware - Headers:", req.headers);
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Auth middleware - No token provided");
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token part
  console.log("Auth middleware - Token received:", token.substring(0, 20) + "...");
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth middleware - Decoded token:", decoded);
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    console.error("Auth middleware - Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

