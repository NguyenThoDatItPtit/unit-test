import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { query } from "../config/database";

const JWT_SECRET = process.env.JSON_TOKEN_KEY || "mysecret";

const Authentication = {
  // Middleware kiểm tra token
  async AuthenticateToken(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"
      
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      
      // verify token (sẽ throw nếu invalid)
      const decoded: any = jwt.verify(token, JWT_SECRET);

      // tìm role_id theo user_id từ DB
      const result = await query(
        `SELECT user_id, email, role_id FROM "user" WHERE user_id = $1`,
        [decoded.user_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // gắn user vào req
      (req as any).user = result.rows[0];
      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  },

  // Middleware kiểm tra vai trò

  AuthorizeRoles(...roles: (string | number)[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const user_role = (req as any).user?.role_id;
        
        if (!user_role) {
          return res.status(401).json({ message: "Unauthorized" });
        }

        // ép kiểu đồng nhất
        if (!roles.map(r => String(r)).includes(String(user_role))) {
          return res
            .status(403)
            .json({ message: "Forbidden: Insufficient role" });
        }

        next();
      } catch (error) {
        return res.status(500).json({ message: "Server error", error });
      }
    };
  },
};

export default Authentication;
