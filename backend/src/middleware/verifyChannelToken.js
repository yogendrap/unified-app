// middleware/verifyChannelToken.js
import jwt from "jsonwebtoken";

export function verifyChannelToken(requiredChannel) {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "Missing token" });
    const token = auth.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.channel !== requiredChannel) {
        return res.status(403).json({ message: "Invalid channel token" });
      }
      req.channelUser = decoded; // { userId, orgId, channel, iat, exp }
      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  };
}
