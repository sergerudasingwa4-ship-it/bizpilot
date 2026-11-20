"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { token, user, logout } = useAuthStore();
  const router = useRouter();

  // Protection de la route : pas de token → on renvoie au login
  useEffect(() => {
    if (!token) router.push("/");
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">🎉 Connecté !</h1>
        <p className="text-gray-600">
          Bienvenue {user?.fullName || "à bord"} — {user?.email}
        </p>
        <p className="text-xs text-gray-400 break-all max-w-md mx-auto">
          Token : {token.slice(0, 40)}…
        </p>
        <Button
          variant="outline"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}