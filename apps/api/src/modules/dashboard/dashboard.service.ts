import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboard = async (companyId: string) => {
  // 1. Chiffre d'affaires (total des ventes)
  const sales = await prisma.sale.findMany({ where: { companyId } });
  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);

  // 2. Total des dépenses
  const expenses = await prisma.expense.findMany({ where: { companyId } });
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // 3. Bénéfice net
  const netProfit = totalRevenue - totalExpenses;

  // 4. Solde de caisse
  const movements = await prisma.cashMovement.findMany({ where: { companyId } });
  const totalIn = movements.filter(m => m.type === "IN").reduce((sum, m) => sum + Number(m.amount), 0);
  const totalOut = movements.filter(m => m.type === "OUT").reduce((sum, m) => sum + Number(m.amount), 0);
  const cashBalance = totalIn - totalOut;

  // 5. Valeur du stock (prix d'achat × stock)
  const products = await prisma.product.findMany({ where: { companyId, isActive: true } });
  const stockValue = products.reduce((sum, p) => sum + (Number(p.costPrice || 0) * p.currentStock), 0);

  // 6. Produits en alerte (stock < seuil)
  const lowStockProducts = products.filter(p => p.currentStock < p.lowStockThreshold);

  return {
    revenue: {
      total: totalRevenue,
      count: sales.length,
    },
    expenses: {
      total: totalExpenses,
      count: expenses.length,
    },
    profit: {
      net: netProfit,
      margin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0,
    },
    cash: {
      balance: cashBalance,
      in: totalIn,
      out: totalOut,
    },
    stock: {
      value: stockValue,
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map(p => ({
        id: p.id,
        name: p.name,
        currentStock: p.currentStock,
        threshold: p.lowStockThreshold,
      })),
    },
  };
};