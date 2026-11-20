"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Field, FormError } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function NewUserForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState({ name: "", email: "", password: "", confirm: "" });

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (fields.password !== fields.confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fields.name, email: fields.email, password: fields.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al crear el usuario."); return; }
      toast.success(`Usuario ${data.name} creado`);
      setFields({ name: "", email: "", password: "", confirm: "" });
      setOpen(false);
      onCreated();
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="primary" onClick={() => setOpen(true)}>
        <Plus strokeWidth={1.75} aria-hidden />
        Nuevo usuario
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-background p-5 shadow-soft space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <UserPlus className="size-4 text-foreground-muted" strokeWidth={1.75} />
        <span className="text-sm font-medium text-foreground">Nuevo usuario administrador</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="u-name">
          <Input id="u-name" value={fields.name} onChange={set("name")} placeholder="María García" required autoFocus />
        </Field>
        <Field label="Email" htmlFor="u-email">
          <Input id="u-email" type="email" value={fields.email} onChange={set("email")} placeholder="maria@empresa.com" required />
        </Field>
        <Field label="Contraseña" htmlFor="u-pass">
          <Input id="u-pass" type="password" value={fields.password} onChange={set("password")} placeholder="Mínimo 8 caracteres" required />
        </Field>
        <Field label="Confirmar contraseña" htmlFor="u-confirm">
          <Input id="u-confirm" type="password" value={fields.confirm} onChange={set("confirm")} placeholder="Repetí la contraseña" required />
        </Field>
      </div>

      {error && <FormError>{error}</FormError>}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={() => { setOpen(false); setError(""); }}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Creando…" : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
}

function UserRow({ user, currentEmail, onDeleted }: { user: AdminUser; currentEmail: string; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  const isSelf = user.email === currentEmail;

  async function deleteUser() {
    if (!window.confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "No se pudo eliminar el usuario"); return; }
      toast.success("Usuario eliminado");
      onDeleted();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <Avatar name={user.name} size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">
          {user.name}
          {isSelf && <span className="ml-2 text-xs text-foreground-subtle font-normal">(vos)</span>}
        </p>
        <p className="text-xs text-foreground-muted truncate">{user.email}</p>
      </div>
      <p className="hidden sm:block text-xs text-foreground-subtle shrink-0">{formatDate(user.createdAt)}</p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={deleteUser}
        disabled={loading || isSelf}
        title={isSelf ? "No podés eliminar tu propio usuario" : `Eliminar a ${user.name}`}
        className="text-foreground-muted hover:text-danger"
      >
        <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
      </Button>
    </div>
  );
}

export function UserManager({ initialUsers, currentEmail }: { initialUsers: AdminUser[]; currentEmail: string }) {
  const [users, setUsers] = useState(initialUsers);
  const router = useRouter();

  function refresh() {
    router.refresh();
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => {});
  }

  return (
    <div className="space-y-6">
      <NewUserForm onCreated={refresh} />

      <div className="rounded-2xl border border-border bg-background shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-medium text-foreground">
            {users.length} {users.length === 1 ? "usuario" : "usuarios"}
          </p>
        </div>
        <div className="px-5">
          {users.map((u) => (
            <UserRow key={u.id} user={u} currentEmail={currentEmail} onDeleted={refresh} />
          ))}
        </div>
      </div>
    </div>
  );
}
