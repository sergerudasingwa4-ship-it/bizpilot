import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createSale = async (
  companyId: string,
  userId: string,
  items: { productId: string; quantity: number; unitPrice: number }[],
  paymentMethod: string,
  notes?: string
) => {
  let totalAmount = 0;
  const saleItemsData = [];

  // 1. Vérifier le stock et calculer le total
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product) throw new Error(`Produit non trouvé`);
    if (product.companyId !== companyId) throw new Error(`Le produit n'appartient pas à cette entreprise`);
    if (product.currentStock < item.quantity) {
      throw new Error(`Stock insuffisant pour "${product.name}" (Disponible: ${product.currentStock}, Demandé: ${item.quantity})`);
    }

    const subtotal = item.quantity * item.unitPrice;
    totalAmount += subtotal;

    saleItemsData.push({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: subtotal,
    });
  }

  const saleNumber = `VNT-${Date.now()}`;

  // 2. Tout exécuter dans une transaction (tout ou rien)
  const sale = await prisma.$transaction(async (tx) => {
    // Créer la vente et ses articles
    const newSale = await tx.sale.create({
      data: {
        companyId,
        saleNumber,
        totalAmount,
        paymentMethod,
        notes,
        items: { create: saleItemsData },
      },
      include: { items: { include: { product: true } } },
    });

    // Mettre à jour le stock et créer les mouvements
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { decrement: item.quantity } },
      });

      await tx.stockMovement.create({
        data: {
          companyId,
          productId: item.productId,
          type: "OUT",
          quantity: item.quantity,
          reason: `Vente ${saleNumber}`,
        },
      });
    }

    // Enregistrer l'entrée d'argent en caisse
    await tx.cashMovement.create({
      data: {
        companyId,
        type: "IN",
        amount: totalAmount,
        description: `Vente ${saleNumber}`,
        saleId: newSale.id,
      },
    });

    return newSale;
  });

  return sale;
};

export const getCompanySales = async (companyId: string) => {
  return prisma.sale.findMany({
    where: { companyId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
};