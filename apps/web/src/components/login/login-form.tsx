"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, Store, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Identifiants invalides");

      login(data.data.token, {
        email: data.data.user?.email ?? email,
        fullName: data.data.user?.fullName,
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="border border-slate-200 shadow-lg bg-white">
        <CardHeader className="space-y-1 text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
            <Store className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            BizPilot
          </CardTitle>
          <CardDescription className="text-slate-500">
            Connectez-vous pour gérer votre boutique
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Champ Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="owner@bizpilot.rw"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
              />
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ✅ LA CORRECTION D'ESPACEMENT DEMANDÉE */}
           {/* ✅ ESPACEMENT FORCÉ (ml-auto pousse le lien à droite) */}
<div className="flex items-center justify-between gap-6 text-sm pt-1 w-full">
  <label className="flex items-center space-x-2 cursor-pointer text-slate-600">
    <input type="checkbox" className="rounded border-slate-300" />
    <span>Se souvenir de moi</span>
  </label>
  <a
    href="#"
    className="ml-auto text-blue-600 hover:text-blue-800 font-medium transition-colors"
  >
    Mot de passe oublié ?
  </a>
</div>

            {/* Message d'erreur */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Bouton de connexion */}
            <Button
              type="submit"
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            © 2026 BizPilot · Kigali, Rwanda
          </div>
        </CardContent>
      </Card>
    </div>
  );
}