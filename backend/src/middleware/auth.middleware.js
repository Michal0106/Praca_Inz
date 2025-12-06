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
  if (
    process.env.NODE_ENV !== "production" &&
    (!req.session || !req.session.userId)
  ) {
    console.log("Dev mode: Using mock user");
    req.user = { id: "486a47c8-a58c-46fb-912e-602c9b5674f1" };
    return next();
  }

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
    } catch (error) {}
  }

  if (req.session && req.session.userId) {
    req.user = {
      userId: req.session.userId,
      id: req.session.userId,
    };
    return next();
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("Dev mode: Using mock user");
    req.user = {
      userId: "486a47c8-a58c-46fb-912e-602c9b5674f1",
      id: "486a47c8-a58c-46fb-912e-602c9b5674f1",
    };
    return next();
  }

  return res.status(401).json({ error: "Unauthorized" });
};
