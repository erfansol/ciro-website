"use server";

import { revalidatePath } from "next/cache";
import { writeAdminTheme } from "@/lib/adminTheme";

export async function setAdminThemeAction(theme: "dark" | "light") {
  await writeAdminTheme(theme);
  revalidatePath("/admin");
}
