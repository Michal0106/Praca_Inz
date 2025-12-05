import { jwtService } from "../services/jwt.service.js";

export const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);

    const decoded = jwtService.verifyAccessToken(token);

    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (error) {
    console.error("JWT authentication error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const optionalAuthenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      const token = authHeader.substring(7);
      const decoded = jwtService.verifyAccessToken(token);
      req.user = { userId: decoded.userId };
    }

    next();
  } catch (error) {
    next();
  }
};

export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    req.user = { id: req.session.userId };
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
};

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwtService.verifyAccessToken(token);

      req.user = {
        userId: decoded.userId,
        id: decoded.userId,
      };
      return next();
    } catch (error) {
      console.error("JWT authentication error:", error);
    }
  }

  return res.status(401).json({ error: "Unauthorized" });
};
