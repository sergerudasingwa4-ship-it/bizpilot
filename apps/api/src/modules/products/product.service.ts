import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createProduct = async (
  companyId: string,
  data: {
    name: string;
    unitPrice: number;
    sku?: string;
    costPrice?: number;
    currentStock?: number;
    lowStockThreshold?: number;
  }
) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new Error("Entreprise non trouvée");

  return prisma.product.create({
    data: {
      companyId,
      name: data.name,
      sku: data.sku,
      unitPrice: data.unitPrice,
      costPrice: data.costPrice,
      currentStock: data.currentStock ?? 0,
      lowStockThreshold: data.lowStockThreshold ?? 5,
    },
  });
};

export const getProductsByCompany = async (companyId: string) => {
  return prisma.product.findMany({
    where: { companyId, isActive: true },
    orderBy: { createdAt: "desc" },
  });
};