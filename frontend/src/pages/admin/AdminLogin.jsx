import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatApiErrorDetail } from "@/lib/api";
import { Lock, PartyPopper } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/admin/dashboard", { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center justify-center px-5">
      <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] bg-sky-300 blob" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-amber-300 blob" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <span className="w-12 h-12 rounded-2xl bg-sky-500 text-white grid place-items-center">
            <PartyPopper className="w-6 h-6" />
          </span>
          <span className="font-heading text-2xl font-bold">Kids Feast</span>
        </Link>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-sky-500/10 p-8 sm:p-10" data-testid="admin-login-card">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 grid place-items-center mx-auto mb-5">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="font-heading text-3xl font-black text-center text-slate-900">Admin Login</h1>
          <p className="text-center text-slate-600 mt-2 text-sm">Secure access for the team only.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@kidsfeast.com" className="rounded-2xl py-6" required data-testid="login-email" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="rounded-2xl py-6" required data-testid="login-password" />
            </div>
            {error && (
              <div className="rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 text-sm font-semibold" data-testid="login-error">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-6 text-lg" data-testid="login-submit">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs text-slate-500">
          ← <Link to="/" className="hover:text-slate-700">back to the site</Link>
        </p>
      </div>
    </div>
  );
}
