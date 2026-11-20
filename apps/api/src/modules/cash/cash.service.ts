import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCashMovements = async (companyId: string) => {
  return prisma.cashMovement.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
};

export const getCashBalance = async (companyId: string) => {
  const movements = await prisma.cashMovement.findMany({
    where: { companyId },
  });

  const totalIn = movements
    .filter(m => m.type === "IN")
    .reduce((sum, m) => sum + Number(m.amount), 0);

  const totalOut = movements
    .filter(m => m.type === "OUT")
    .reduce((sum, m) => sum + Number(m.amount), 0);

  return {
    totalIn,
    totalOut,
    balance: totalIn - totalOut,
    movementCount: movements.length,
  };
};