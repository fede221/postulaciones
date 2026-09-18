"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/Logo";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FormError, Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (!result || result.error) {
        setError("Email o contraseña incorrectos. Si probaste varias veces, esperá unos minutos.");
        setLoading(false);
        return;
      }
      router.push("/admin/dashboard");
    } catch {
      setError("No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-5 py-12 animate-in">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 flex flex-col items-center text-center">
              <Wordmark size="lg" />
              <h1 className="mt-5 text-xl text-foreground">Panel de selección</h1>
              <p className="mt-1 text-sm text-foreground-muted">Ingresá con tu cuenta de RRHH</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Email" htmlFor="login-email">
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="nombre@empresa.com"
                />
              </Field>
              <Field label="Contraseña" htmlFor="login-password">
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>

              <FormError>{error}</FormError>

              <Button type="submit" variant="primary" className="w-full" loading={loading}>
                Ingresar
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 flex justify-center">
          <ButtonLink href="/" variant="ghost" size="sm">
            Volver al sitio
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
