"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { NewExpenseDialog } from "@/components/expenses/new-expense-dialog";
import { TrendingDown } from "lucide-react";

export default function ExpensesPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
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

  const fetchExpenses = async () => {
    if (!token) return;

    try {
      const companiesRes = await fetch("http://localhost:4000/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const companiesData = await companiesRes.json();
      const companies = Array.isArray(companiesData) ? companiesData : (companiesData.data || []);

      let selectedCompanyId = null;
      for (const company of companies) {
        const expensesRes = await fetch(
          `http://localhost:4000/expenses/company/${company.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const expensesData = await expensesRes.json();
        const expensesList = Array.isArray(expensesData) ? expensesData : (expensesData.data || []);

        if (expensesList.length > 0) {
          selectedCompanyId = company.id;
          setExpenses(expensesList);
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
      fetchExpenses();
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
              <TrendingDown className="w-6 h-6" />
              Dépenses
            </h2>
            <p className="text-slate-500">Gérez vos charges et dépenses</p>
          </div>
          {companyId && (
            <NewExpenseDialog
              companyId={companyId}
              token={token}
              onExpenseCreated={fetchExpenses}
            />
          )}
        </div>

        {expenses.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <TrendingDown className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucune dépense
            </h3>
            <p className="text-slate-500">
              Cliquez sur "Ajouter une dépense" pour enregistrer votre première dépense
            </p>
          </div>
        ) : (
          <ExpenseTable expenses={expenses} />
        )}
      </div>
    </DashboardLayout>
  );
}