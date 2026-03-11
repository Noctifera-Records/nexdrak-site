import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/login");
    }
    
    const user = session.user as any;
    
    if (user.role !== "admin") {
        redirect("/");
    }

    return <AdminShell user={session.user}>{children}</AdminShell>;
}
