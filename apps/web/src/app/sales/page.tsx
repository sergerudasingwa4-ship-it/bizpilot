"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { SaleTable } from "@/components/sales/sale-table";
import { NewSaleDialog } from "@/components/sales/new-sale-dialog";
import { Receipt } from "lucide-react";

export default function SalesPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [sales, setSales] = useState<any[]>([]);
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

  const fetchSales = async () => {
    if (!token) return;

    try {
      const companiesRes = await fetch("http://localhost:4000/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const companiesData = await companiesRes.json();
      const companies = Array.isArray(companiesData) ? companiesData : (companiesData.data || []);

      let selectedCompanyId = null;
      for (const company of companies) {
        const salesRes = await fetch(
          `http://localhost:4000/sales/company/${company.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const salesData = await salesRes.json();
        const salesList = Array.isArray(salesData) ? salesData : (salesData.data || []);
        
        if (salesList.length > 0) {
          selectedCompanyId = company.id;
          setSales(salesList);
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
      fetchSales();
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-6 h-6" />
              Ventes
            </h2>
            <p className="text-slate-500">Historique des ventes</p>
          </div>
          {companyId && (
            <NewSaleDialog
              companyId={companyId}
              token={token}
              onSaleCreated={fetchSales}
            />
          )}
        </div>

        {sales.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Receipt className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucune vente
            </h3>
            <p className="text-slate-500">
              Cliquez sur "Nouvelle vente" pour enregistrer votre première vente
            </p>
          </div>
        ) : (
          <SaleTable sales={sales} />
        )}
      </div>
    </DashboardLayout>
  );
}