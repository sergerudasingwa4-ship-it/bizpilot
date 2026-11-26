"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CashMovementsTable } from "@/components/cash/cash-movements-table";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export default function CashPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [balance, setBalance] = useState({ totalIn: 0, totalOut: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !token) {
      router.push("/");
    }
  }, [isHydrated, token, router]);

  const fetchCashData = async () => {
    if (!token) return;

    try {
      const companiesRes = await fetch("http://localhost:4000/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const companiesData = await companiesRes.json();
      const companies = Array.isArray(companiesData) ? companiesData : (companiesData.data || []);

      let selectedCompanyId = null;
      for (const company of companies) {
        const movementsRes = await fetch(
          `http://localhost:4000/cash/company/${company.id}/movements`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const movementsData = await movementsRes.json();
        const movementsList = Array.isArray(movementsData) ? movementsData : (movementsData.data || []);

        if (movementsList.length > 0) {
          selectedCompanyId = company.id;
          setMovements(movementsList);

          // Calculer le solde
          const totalIn = movementsList
            .filter((m: any) => m.type === "IN")
            .reduce((sum: number, m: any) => sum + Number(m.amount), 0);
          const totalOut = movementsList
            .filter((m: any) => m.type === "OUT")
            .reduce((sum: number, m: any) => sum + Number(m.amount), 0);
          setBalance({ totalIn, totalOut, balance: totalIn - totalOut });
          break;
        }
      }

      setCompanyId(selectedCompanyId);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHydrated && token) {
      fetchCashData();
    }
  }, [isHydrated, token]);

  if (!isHydrated || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!token) return null;

  const formatRWF = (amount: number) => {
    return new Intl.NumberFormat("fr-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6" />
            Caisse
          </h2>
          <p className="text-slate-500">Solde et mouvements de caisse en temps réel</p>
        </div>

        {/* Solde de caisse */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Entrées</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{formatRWF(balance.totalIn)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Sorties</span>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{formatRWF(balance.totalOut)}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Solde</span>
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <p
              className={`text-2xl font-bold ${
                balance.balance >= 0 ? "text-blue-600" : "text-red-600"
              }`}
            >
              {formatRWF(balance.balance)}
            </p>
          </div>
        </div>

        {/* Mouvements */}
        {movements.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Wallet className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucun mouvement
            </h3>
            <p className="text-slate-500">
              Les mouvements de caisse apparaîtront ici après vos ventes et dépenses
            </p>
          </div>
        ) : (
          <CashMovementsTable movements={movements} />
        )}
      </div>
    </DashboardLayout>
  );
}