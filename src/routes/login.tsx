
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) throw loginError;

      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_admin");

      if (adminError) throw adminError;

      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error("You do not have admin access.");
      }

      await navigate({ to: "/admin" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        <p className="eyebrow">Gaz Gaz Soukra</p>
        <h1 className="mt-2 text-4xl font-bold">Admin Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to access the shop dashboard.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm">Email</label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-md border border-input bg-background px-3 outline-none focus:border-primary"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-md border border-input bg-background px-3 outline-none focus:border-primary"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

