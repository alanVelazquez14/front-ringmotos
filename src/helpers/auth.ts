import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  sub?: string;
  id?: string;
  email?: string;
};

export const getUserIdFromToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.id || decoded.sub || null;
  } catch {
    return null;
  }
};
