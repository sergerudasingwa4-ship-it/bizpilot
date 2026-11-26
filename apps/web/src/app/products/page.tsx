"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ProductTable } from "@/components/products/product-table";
import { AddProductDialog } from "@/components/products/add-product-dialog";
import { Package } from "lucide-react";

export default function ProductsPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ NOUVEAU : Attendre que Zustand ait fini de lire le localStorage
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // ✅ Ne redirige que si on est sûr que le stockage a été vérifié
    if (isHydrated && !token) {
      router.push("/");
    }
  }, [isHydrated, token, router]);

  const fetchProducts = async () => {
    if (!token) return;

    try {
      const companiesRes = await fetch("http://localhost:4000/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const companiesData = await companiesRes.json();
      
      // ✅ PLUS ROBUSTE : gère si l'API renvoie directement le tableau ou { data: [...] }
      const companies = Array.isArray(companiesData) ? companiesData : (companiesData.data || []);

      let selectedCompanyId = null;
      for (const company of companies) {
        const productsRes = await fetch(
          `http://localhost:4000/products/company/${company.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const productsData = await productsRes.json();
        
        const productsList = Array.isArray(productsData) ? productsData : (productsData.data || []);
        
        if (productsList.length > 0) {
          selectedCompanyId = company.id;
          setProducts(productsList);
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
      fetchProducts();
    }
  }, [isHydrated, token]);

  // ✅ Affiche un chargement tant que Zustand n'a pas fini de s'initialiser
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
              <Package className="w-6 h-6" />
              Produits
            </h2>
            <p className="text-slate-500">Gérez votre catalogue de produits</p>
          </div>
          {companyId && (
            <AddProductDialog
              companyId={companyId}
              token={token}
              onProductAdded={fetchProducts}
            />
          )}
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Aucun produit
            </h3>
            <p className="text-slate-500">
              Commencez par ajouter votre premier produit
            </p>
          </div>
        ) : (
          <ProductTable products={products} />
        )}
      </div>
    </DashboardLayout>
  );
}