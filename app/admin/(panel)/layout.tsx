import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminMobileBar, AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileBar />
        <main className="container-admin flex-1 py-6 lg:py-10 animate-slide-up">
          {children}
        </main>
      </div>
    </div>
  );
}
