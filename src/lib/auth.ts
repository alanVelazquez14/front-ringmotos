import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  sub?: string;
  id?: string;
  userId?: string;
  email?: string;
  role?: string;
};

export function getUserFromToken() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    return {
      id: decoded.sub || decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}
