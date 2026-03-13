import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import ApplyForm from "./ApplyForm";

export const dynamic = "force-dynamic";

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id, isActive: true } });
  if (!job) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10 w-full flex-1">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="mb-8">
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              {job.department}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-1">
              Postulación: {job.title}
            </h1>
            <p className="text-slate-500">
              📍 {job.location} &nbsp;·&nbsp; 🕐 {job.type}
            </p>
          </div>

          <ApplyForm jobId={job.id} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
