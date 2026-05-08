import "server-only";
import { cookies } from "next/headers";

export type AdminTheme = "dark" | "light";
const COOKIE = "ciro_admin_theme";

export async function readAdminTheme(): Promise<AdminTheme> {
  const jar = await cookies();
  const v = jar.get(COOKIE)?.value;
  return v === "light" ? "light" : "dark";
}

export async function writeAdminTheme(theme: AdminTheme): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
