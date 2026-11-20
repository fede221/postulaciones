import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { UserManager } from "./UserManager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  const users = await prisma.admin.findMany({
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Usuarios"
        description="Administradores con acceso al panel"
      />
      <UserManager
        initialUsers={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
        currentEmail={session?.user?.email ?? ""}
      />
    </div>
  );
}
