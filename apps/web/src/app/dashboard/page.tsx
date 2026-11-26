"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { TrendingUp, TrendingDown, DollarSign, Wallet, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Dashboard() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) router.push("/");
  }, [token, router]);

  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      try {
        const companiesRes = await fetch("http://localhost:4000/companies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const companiesData = await companiesRes.json();
        const companies = companiesData.data;

        let selectedCompanyId = null;
        for (const company of companies) {
          const productsRes = await fetch(
            `http://localhost:4000/products/company/${company.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const productsData = await productsRes.json();
          if (productsData.data && productsData.data.length > 0) {
            selectedCompanyId = company.id;
            break;
          }
        }

        if (!selectedCompanyId) {
          setLoading(false);
          return;
        }

        setCompanyId(selectedCompanyId);

        const dashboardRes = await fetch(
          `http://localhost:4000/dashboard/company/${selectedCompanyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const dashboardResult = await dashboardRes.json();
        setDashboardData(dashboardResult.data);
      } catch (error) {
        console.error("Erreur dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (!token) return null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Aucune donnée disponible</p>
        </div>
      </DashboardLayout>
    );
  }

  const formatRWF = (amount: number) => {
    return new Intl.NumberFormat("fr-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const chartData = [
    {
      name: "Total",
      "Chiffre d'affaires": dashboardData.revenue.total,
      "Dépenses": dashboardData.expenses.total,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tableau de bord</h2>
          <p className="text-slate-500">Vue d'ensemble de votre boutique</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Chiffre d'affaires"
            value={formatRWF(dashboardData.revenue.total)}
            icon={TrendingUp}
            color="green"
          />
          <KpiCard
            title="Dépenses"
            value={formatRWF(dashboardData.expenses.total)}
            icon={TrendingDown}
            color="red"
          />
          <KpiCard
            title="Bénéfice net"
            value={formatRWF(dashboardData.profit.net)}
            icon={DollarSign}
            color={dashboardData.profit.net >= 0 ? "green" : "red"}
          />
          <KpiCard
            title="Solde de caisse"
            value={formatRWF(dashboardData.cash.balance)}
            icon={Wallet}
            color="blue"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Chiffre d'affaires vs Dépenses</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  formatter={(value: number) => formatRWF(value)}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="Chiffre d'affaires" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Produits en alerte
            </h3>
            {dashboardData.stock.lowStockCount === 0 ? (
              <p className="text-slate-500 text-sm">✅ Aucun produit en stock bas</p>
            ) : (
              <div className="space-y-3">
                {dashboardData.stock.lowStockProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">
                        Stock actuel : {product.currentStock}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-amber-700">⚠️ Bas</p>
                      <p className="text-xs text-slate-500">
                        Seuil : {product.threshold}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}