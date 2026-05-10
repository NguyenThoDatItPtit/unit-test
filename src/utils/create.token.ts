import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JSON_TOKEN_KEY || "mysecret";

export default function CreateToken (user_id: number, email: string) {
  return jwt.sign({ user_id, email }, JWT_SECRET, { expiresIn: "1d" });
};
