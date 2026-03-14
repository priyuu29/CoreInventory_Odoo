import { verifyToken } from "@/lib/auth";
import { User } from "@/lib/models";
import { Types } from "mongoose";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  const user = await User.findById(decoded.userId).select("-password");
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function toObjectId(id: string): Types.ObjectId {
  return new Types.ObjectId(id);
}
