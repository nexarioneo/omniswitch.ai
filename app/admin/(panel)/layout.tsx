import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser, SESSION_COOKIE } from "@/features/data/sessions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!getSessionUser(token)) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
