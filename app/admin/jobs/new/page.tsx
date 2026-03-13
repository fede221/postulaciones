import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";
import JobForm from "../JobForm";

export default async function NewJobPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="mb-6">
          <Link href="/admin/jobs" className="text-slate-500 hover:text-slate-700 text-sm">
            ← Volver a puestos
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-800 mt-2">Nuevo puesto</h1>
        </div>
        <div className="max-w-3xl">
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <JobForm />
          </div>
        </div>
      </main>
    </div>
  );
}
