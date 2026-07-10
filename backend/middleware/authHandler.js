import jwt from "jsonwebtoken";

export const authHandlerMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized: Please login first" ,code: "NO_TOKEN" });
    }

    let payload;

    try {
      payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid or Expired token", code: "TOKEN_EXPIRED" });
    }

    req.user = payload;

    next();
    
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ success: false, message: "Server error in authentication" });
  }
};